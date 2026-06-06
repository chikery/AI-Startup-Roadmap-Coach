import json
import os
from pathlib import Path
from typing import List

from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_community.vectorstores import FAISS
from langchain.schema import Document
from langchain.prompts import PromptTemplate
from langchain.chains import RetrievalQA

from app.config import settings

SAMPLE_DATA_PATH = Path(__file__).parent.parent / "data" / "sample_programs.json"
FAISS_INDEX_PATH = Path(__file__).parent / "faiss_index"


def load_documents() -> List[Document]:
    with open(SAMPLE_DATA_PATH, "r", encoding="utf-8") as f:
        programs = json.load(f)

    docs = []
    for p in programs:
        content = (
            f"사업명: {p['name']}\n"
            f"주관기관: {p['organization']}\n"
            f"지원분야: {p['target_category']}\n"
            f"창업단계: {p['target_stage']}\n"
            f"지역: {p.get('region', '전국')}\n"
            f"지원내용: {p['support_type']} {p.get('support_amount', '')}\n"
            f"자격조건: {p.get('eligibility', '')}\n"
            f"설명: {p['description']}"
        )
        docs.append(Document(page_content=content, metadata={"program_id": p["id"], "name": p["name"]}))
    return docs


def build_vectorstore() -> FAISS:
    embeddings = OpenAIEmbeddings(openai_api_key=settings.openai_api_key)
    docs = load_documents()
    vectorstore = FAISS.from_documents(docs, embeddings)
    vectorstore.save_local(str(FAISS_INDEX_PATH))
    return vectorstore


def get_vectorstore() -> FAISS:
    embeddings = OpenAIEmbeddings(openai_api_key=settings.openai_api_key)
    if FAISS_INDEX_PATH.exists():
        return FAISS.load_local(str(FAISS_INDEX_PATH), embeddings, allow_dangerous_deserialization=True)
    return build_vectorstore()


def recommend_programs(item_keyword: str, category: str, stage: str, region: str, has_team: str) -> List[dict]:
    vectorstore = get_vectorstore()
    query = f"창업 아이템: {item_keyword}, 분야: {category}, 단계: {stage}, 지역: {region}"
    retriever = vectorstore.as_retriever(search_kwargs={"k": 5})

    llm = ChatOpenAI(model="gpt-4o-mini", openai_api_key=settings.openai_api_key, temperature=0)

    prompt = PromptTemplate(
        input_variables=["context", "question"],
        template="""당신은 창업 지원사업 전문 컨설턴트입니다.
아래 지원사업 정보를 바탕으로, 사용자의 창업 아이템에 가장 적합한 사업을 추천하고 그 이유를 설명해주세요.

지원사업 정보:
{context}

사용자 정보:
{question}

각 추천 사업에 대해 JSON 배열 형식으로 응답하세요:
[{{"program_name": "...", "match_reason": "이 사업이 적합한 구체적인 이유 2~3문장"}}]"""
    )

    chain = RetrievalQA.from_chain_type(
        llm=llm,
        chain_type="stuff",
        retriever=retriever,
        chain_type_kwargs={"prompt": prompt},
        return_source_documents=True,
    )

    result = chain.invoke({"query": query})

    try:
        raw = result["result"].strip()
        if raw.startswith("```"):
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        match_reasons = {item["program_name"]: item["match_reason"] for item in json.loads(raw)}
    except Exception:
        match_reasons = {}

    source_ids = [doc.metadata["program_id"] for doc in result["source_documents"]]

    with open(SAMPLE_DATA_PATH, "r", encoding="utf-8") as f:
        all_programs = {p["id"]: p for p in json.load(f)}

    recommendations = []
    for pid in source_ids:
        if pid in all_programs:
            prog = all_programs[pid].copy()
            prog["match_reason"] = match_reasons.get(prog["name"], "해당 분야 및 창업 단계에 적합한 사업입니다.")
            recommendations.append(prog)

    return recommendations
