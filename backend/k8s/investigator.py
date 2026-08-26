from kubernetes.client.exceptions import ApiException

from .client import get_kubernetes_client


def get_all_pods():
    try:
        v1 = get_kubernetes_client()
        pods = v1.list_pod_for_all_namespaces(watch=False)

        results = []

        for pod in pods.items:
            containers = []

            if pod.status.container_statuses:
                for container in pod.status.container_statuses:

                    state = "Unknown"
                    reason = None

                    if container.state.running:
                        state = "Running"

                    elif container.state.waiting:
                        state = "Waiting"
                        reason = container.state.waiting.reason

                    elif container.state.terminated:
                        state = "Terminated"
                        reason = container.state.terminated.reason

                    containers.append({
                        "name": container.name,
                        "ready": container.ready,
                        "restart_count": container.restart_count,
                        "state": state,
                        "reason": reason,
                    })

            results.append({
                "name": pod.metadata.name,
                "namespace": pod.metadata.namespace,
                "phase": pod.status.phase,
                "containers": containers,
            })

        return results

    except ApiException as error:
        return {
            "error": str(error)
        }


def get_unhealthy_pods():
    pods = get_all_pods()
    unhealthy_pods = []

    if isinstance(pods, dict) and "error" in pods:
        return pods

    for pod in pods:
        problems = []

        for container in pod["containers"]:
            if not container["ready"]:
                problems.append({
                    "container": container["name"],
                    "state": container["state"],
                    "reason": container["reason"],
                    "restart_count": container["restart_count"],
                })

        if pod["phase"] not in ["Running", "Succeeded"] or problems:
            unhealthy_pods.append({
                "name": pod["name"],
                "namespace": pod["namespace"],
                "phase": pod["phase"],
                "problems": problems,
            })

    return unhealthy_pods

def get_pod_logs(pod_name, namespace, container_name=None, previous=False):
    try:
        v1 = get_kubernetes_client()

        logs = v1.read_namespaced_pod_log(
            name=pod_name,
            namespace=namespace,
            container=container_name,
            previous=previous,
            tail_lines=100,
        )

        if isinstance(logs, bytes):
            logs = logs.decode("utf-8")

        return logs.decode("utf-8") if isinstance(logs, bytes) else str(logs)

    except ApiException as error:
        return f"Unable to retrieve logs: {error}"


def get_pod_events(pod_name, namespace):
    try:
        v1 = get_kubernetes_client()

        events = v1.list_namespaced_event(
            namespace=namespace,
            field_selector=f"involvedObject.name={pod_name}"
        )

        results = []

        for event in events.items:
            results.append({
                "type": event.type,
                "reason": event.reason,
                "message": event.message,
                "count": event.count,
            })

        return results

    except ApiException as error:
        return {
            "error": str(error)
        }

def investigate_pod(pod_name, namespace):
    pods = get_all_pods()

    if isinstance(pods, dict) and "error" in pods:
        return pods

    target_pod = None

    for pod in pods:
        if pod["name"] == pod_name and pod["namespace"] == namespace:
            target_pod = pod
            break

    if not target_pod:
        return {
            "error": f"Pod {pod_name} not found in namespace {namespace}"
        }

    investigation = {
        "pod": target_pod,
        "events": get_pod_events(pod_name, namespace),
        "logs": {}
    }

    for container in target_pod["containers"]:
        container_name = container["name"]

        use_previous_logs = (
            container["restart_count"] > 0
            or container["reason"] == "CrashLoopBackOff"
        )

        investigation["logs"][container_name] = get_pod_logs(
            pod_name,
            namespace,
            container_name,
            previous=use_previous_logs
        )

    return investigation

