import os
import zipfile
import sys

def create_project_zip(output_path="/tmp/SaaS_Coursea_JobMatcher_Swiss.zip", root_dir="/"):
    # Target files and folders to include
    include_dirs = ["src", "public"]
    include_files = [
        "package.json",
        "tsconfig.json",
        "tsconfig.node.json",
        "vite.config.ts",
        "index.html",
        "server.ts",
        "metadata.json",
        "README.md",
        ".env.example"
    ]

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        for file_name in include_files:
            file_path = os.path.join(root_dir, file_name)
            if os.path.isfile(file_path):
                zipf.write(file_path, arcname=file_name)

        for dir_name in include_dirs:
            dir_path = os.path.join(root_dir, dir_name)
            if os.path.isdir(dir_path):
                for root, _, files in os.walk(dir_path):
                    for file in files:
                        full_path = os.path.join(root, file)
                        rel_path = os.path.relpath(full_path, root_dir)
                        # Skip unwanted files
                        if any(ignored in rel_path for ignored in ["node_modules", ".git", ".DS_Store"]):
                            continue
                        zipf.write(full_path, arcname=rel_path)

    print(f"Archive successfully generated at {output_path} ({os.path.getsize(output_path)} bytes)")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "/tmp/SaaS_Coursea_JobMatcher_Swiss.zip"
    create_project_zip(out)
