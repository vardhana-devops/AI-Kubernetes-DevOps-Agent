from fastapi import APIRouter

from k8s.investigator import get_all_pods

router = APIRouter(prefix="/api/cluster", tags=["Cluster"])


@router.get("/pods")
def list_pods():
    return {
        "pods": get_all_pods()
    }
