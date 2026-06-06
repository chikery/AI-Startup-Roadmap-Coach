from fastapi import APIRouter, HTTPException
from app.schemas.program import RecommendRequest, RecommendResponse, ProgramResponse
from app.rag.pipeline import recommend_programs

router = APIRouter(prefix="/programs", tags=["programs"])


@router.post("/recommend", response_model=RecommendResponse)
def get_recommendations(body: RecommendRequest):
    try:
        results = recommend_programs(
            item_keyword=body.item_keyword,
            category=body.category,
            stage=body.startup_stage,
            region=body.region or "전국",
            has_team=body.has_team or "solo",
        )
        programs = [ProgramResponse(**r) for r in results]
        return RecommendResponse(programs=programs, total=len(programs))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
