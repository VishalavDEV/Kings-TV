import os
import sys
import paramiko

HOSTNAME = "193.202.45.164"
PORT = 65002
USERNAME = "u841409365"
PASSWORD = "Eash@2005"
REMOTE_DIR = "/home/u841409365/domains/test-technoprint.online/public_html/king-tv"

def create_remote_dir(sftp, remote_path):
    dirs = []
    current = remote_path
    while current and current != "/":
        dirs.insert(0, current)
        current = os.path.dirname(current)
    
    for d in dirs:
        try:
            sftp.mkdir(d)
            print(f"Created remote directory: {d}")
        except IOError:
            pass

def main():
    print("Connecting to remote server via SSH/SFTP...")
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    
    try:
        ssh.connect(hostname=HOSTNAME, port=PORT, username=USERNAME, password=PASSWORD, timeout=30)
        print("SSH Connection successful!")
        sftp = ssh.open_sftp()
        print("SFTP Session started!")
    except Exception as e:
        print(f"Connection failed: {e}")
        sys.exit(1)

    local_root = os.getcwd()
    
    # 1. Upload compiled React Frontend (from frontend/dist) to remote root
    local_frontend_dist = os.path.join(local_root, "frontend", "dist")
    print(f"Uploading compiled frontend from {local_frontend_dist} to {REMOTE_DIR}...")
    create_remote_dir(sftp, REMOTE_DIR)

    uploaded_files_count = 0
    uploaded_dirs_count = 0

    for root, dirs, files in os.walk(local_frontend_dist):
        rel_path = os.path.relpath(root, local_frontend_dist)
        if rel_path == ".":
            remote_current_dir = REMOTE_DIR
        else:
            remote_current_dir = os.path.join(REMOTE_DIR, rel_path).replace("\\", "/")

        try:
            sftp.mkdir(remote_current_dir)
            uploaded_dirs_count += 1
        except IOError:
            pass

        for file in files:
            local_file_path = os.path.join(root, file)
            remote_file_path = os.path.join(remote_current_dir, file).replace("\\", "/")
            print(f"Uploading Frontend Asset: {rel_path}/{file} -> {remote_file_path}...")
            try:
                sftp.put(local_file_path, remote_file_path)
                uploaded_files_count += 1
            except Exception as ex:
                print(f"Failed to upload {file}: {ex}")

    # 2. Upload compiled Admin Portal (from admin/dist) to remote/admin/
    local_admin_dist = os.path.join(local_root, "admin", "dist")
    remote_admin_dir = os.path.join(REMOTE_DIR, "admin").replace("\\", "/")
    print(f"\nUploading compiled admin portal from {local_admin_dist} to {remote_admin_dir}...")
    
    try:
        sftp.mkdir(remote_admin_dir)
        uploaded_dirs_count += 1
    except IOError:
        pass

    for root, dirs, files in os.walk(local_admin_dist):
        rel_path = os.path.relpath(root, local_admin_dist)
        if rel_path == ".":
            remote_current_dir = remote_admin_dir
        else:
            remote_current_dir = os.path.join(remote_admin_dir, rel_path).replace("\\", "/")

        try:
            sftp.mkdir(remote_current_dir)
            uploaded_dirs_count += 1
        except IOError:
            pass

        for file in files:
            local_file_path = os.path.join(root, file)
            remote_file_path = os.path.join(remote_current_dir, file).replace("\\", "/")
            print(f"Uploading Admin Asset: {rel_path}/{file} -> {remote_file_path}...")
            try:
                sftp.put(local_file_path, remote_file_path)
                uploaded_files_count += 1
            except Exception as ex:
                print(f"Failed to upload {file}: {ex}")

    # 3. Upload backend code zip or files (for record keeping in backend/)
    local_backend = os.path.join(local_root, "backend")
    remote_backend = os.path.join(REMOTE_DIR, "backend").replace("\\", "/")
    print(f"\nUploading backend files from {local_backend} to {remote_backend}...")
    
    try:
        sftp.mkdir(remote_backend)
        uploaded_dirs_count += 1
    except IOError:
        pass

    EXCLUDE_BACKEND = {".git", ".gradle", "target", "build", ".idea", ".settings", "bin"}
    for root, dirs, files in os.walk(local_backend):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_BACKEND]
        rel_path = os.path.relpath(root, local_backend)
        if rel_path == ".":
            remote_current_dir = remote_backend
        else:
            remote_current_dir = os.path.join(remote_backend, rel_path).replace("\\", "/")

        try:
            sftp.mkdir(remote_current_dir)
            uploaded_dirs_count += 1
        except IOError:
            pass

        for file in files:
            if file.startswith("."):
                continue
            local_file_path = os.path.join(root, file)
            remote_file_path = os.path.join(remote_current_dir, file).replace("\\", "/")
            try:
                sftp.put(local_file_path, remote_file_path)
                uploaded_files_count += 1
            except Exception as ex:
                pass

    sftp.close()
    ssh.close()
    print(f"\nDeployment completed successfully! Uploaded {uploaded_files_count} files in {uploaded_dirs_count} directories.")
if __name__ == "__main__":
    main()
