import json
import os
import requests
import sys


def help():
    print("Parameters not provided, please use the correct format to emit security event.")
    print("Syntax: python3 security_event_emitter.py <Scan Type> <Stage Name> <Repo Name>")

    print("\nOptions for <Scan Type> Parameter: SAST/SCA")

    print("\nOptions for <Stage Name> parameter:\n")
    print("checkout -> When the repository is checked out in GitHub Actions")
    print("install -> When installation of tools in a GitHub Actions Runner is complete for the specified scan type")
    print("scan -> When scanning of an repository is complete for the specified scan type")
    print("upload -> When scan reports are added to the S3 Bucket in Security Account")


def emit_event(event_payload):
    API_URL = "https://write-to-events-db-nof2zi3rcq-el.a.run.app/create_event"

    headers = {
        "Authorization": "Bearer " + os.environ.get("SECURITY_EMITTER_TOKEN")
    }

    response = requests.post(
        url = API_URL,
        json = event_payload,
        headers = headers
    )

    return response.text


def form_payload(stage, scan_type, repo_name):
    payload = {
        "event_sources_id": 3,
        "entities_id": 36,
        "content": {
            "source": "GitHub Code Scanning - GitHub Actions",
            "scan-type": scan_type,
            "message": str()
        }
    }

    if stage == "checkout":
        payload['content']['message'] = f'The {repo_name} GitHub Repository was checked out in GitHub Actions for {scan_type} Scan'

    elif stage == "install":
        payload['content']['message'] = f'Required tools and AWS CLI were installed on GitHub Actions Runner for {scan_type} Scan of {repo_name} GitHub repository'

    elif stage == "scan":
        payload['content']['message'] = f'{scan_type} Scan of {repo_name} GitHub Repository was completed'

    elif stage == "upload":
        payload['content']['message'] = f'The {scan_type} Scan report for {repo_name} GitHub Repository was uploaded to S3.'

    return payload


def main():
    try:
        scan_type = sys.argv[1]
        stage = sys.argv[2]
        repo_name = sys.argv[3]

        event_payload = form_payload(stage, scan_type, repo_name)
        print("Event Payload:", event_payload)

        response = emit_event(event_payload)
        print("Emittence Response:", response)
    
    except IndexError:
        help()

    except Exception as err:
        print("An unknown error occurred, please debug via code.")
        print("Exception:\n", err)


if __name__ == "__main__":
    main()