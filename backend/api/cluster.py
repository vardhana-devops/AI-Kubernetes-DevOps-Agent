from fastapi import APIRouter
from ai.analyzer import analyze_investigation

from k8s.investigator import (
    get_all_pods,
    get_unhealthy_pods,
    investigate_pod,
)

router = APIRouter(prefix="/api/cluster", tags=["Cluster"])


@router.get("/pods")
def list_pods():
    return {
        "pods": get_all_pods()
    }


@router.get("/issues")
def list_cluster_issues():
    return {
        "issues": get_unhealthy_pods()
    }


@router.get("/investigate/{namespace}/{pod_name}")
def investigate_cluster_pod(namespace: str, pod_name: str):
    return investigate_pod(
        pod_name=pod_name,
        namespace=namespace,
    )
@router.get("/diagnose/{namespace}/{pod_name}")
def diagnose_pod(namespace: str, pod_name: str):
    investigation = investigate_pod(
        pod_name=pod_name,
        namespace=namespace,
    )

    diagnosis = analyze_investigation(investigation)

    return {
        "pod": pod_name,
        "namespace": namespace,
        "investigation": investigation,
        "ai_diagnosis": diagnosis,
    }




