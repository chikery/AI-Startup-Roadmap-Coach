import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.roadmap import RoadmapProgress
from app.schemas.roadmap import StepSave, StepResponse
from app.api.auth import get_current_user

router = APIRouter(prefix="/roadmap", tags=["roadmap"])

TOTAL_STEPS = 7


@router.get("/progress", response_model=list[StepResponse])
def get_all_progress(token: str, db: Session = Depends(get_db)):
    user = get_current_user(token, db)
    rows = db.query(RoadmapProgress).filter(RoadmapProgress.user_id == user.id).all()
    progress_map = {r.step: r for r in rows}

    result = []
    for step in range(1, TOTAL_STEPS + 1):
        if step in progress_map:
            r = progress_map[step]
            result.append(StepResponse(
                step=step,
                is_completed=r.is_completed,
                content=json.loads(r.content) if r.content else None,
                ai_draft=json.loads(r.ai_draft) if r.ai_draft else None,
            ))
        else:
            result.append(StepResponse(step=step, is_completed=False, content=None, ai_draft=None))
    return result


@router.get("/{step}", response_model=StepResponse)
def get_step(step: int, token: str, db: Session = Depends(get_db)):
    if step < 1 or step > TOTAL_STEPS:
        raise HTTPException(status_code=404, detail="존재하지 않는 단계입니다")
    user = get_current_user(token, db)
    row = db.query(RoadmapProgress).filter(
        RoadmapProgress.user_id == user.id, RoadmapProgress.step == step
    ).first()
    if not row:
        return StepResponse(step=step, is_completed=False, content=None, ai_draft=None)
    return StepResponse(
        step=step,
        is_completed=row.is_completed,
        content=json.loads(row.content) if row.content else None,
        ai_draft=json.loads(row.ai_draft) if row.ai_draft else None,
    )


@router.post("/{step}/save", response_model=StepResponse)
def save_step(step: int, body: StepSave, token: str, db: Session = Depends(get_db)):
    if step < 1 or step > TOTAL_STEPS:
        raise HTTPException(status_code=404, detail="존재하지 않는 단계입니다")
    user = get_current_user(token, db)

    # 이전 단계 완료 여부 검증
    if step > 1:
        prev = db.query(RoadmapProgress).filter(
            RoadmapProgress.user_id == user.id, RoadmapProgress.step == step - 1
        ).first()
        if not prev or not prev.is_completed:
            raise HTTPException(status_code=403, detail="이전 단계를 먼저 완료해주세요")

    row = db.query(RoadmapProgress).filter(
        RoadmapProgress.user_id == user.id, RoadmapProgress.step == step
    ).first()
    if not row:
        row = RoadmapProgress(user_id=user.id, step=step)
        db.add(row)

    row.content = json.dumps(body.content, ensure_ascii=False)
    row.is_completed = True
    db.commit()
    db.refresh(row)
    return StepResponse(
        step=step,
        is_completed=row.is_completed,
        content=json.loads(row.content),
        ai_draft=json.loads(row.ai_draft) if row.ai_draft else None,
    )
