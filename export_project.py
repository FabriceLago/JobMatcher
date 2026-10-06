import os
import zipfile
import sys

def create_project_zip(output_path="/tmp/SaaS_Coursea_JobMatcher_Swiss.zip", root_dir="."):
    # Target files and folders to include in Coursera export
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
        "GUIDE_EXPLOITATION_SAAS_SUISSE.md",
        "firestore.rules",
        ".env.example"
    ]

    with zipfile.ZipFile(output_path, "w", zipfile.ZIP_DEFLATED) as zipf:
        # Add root configuration files
        for file_name in include_files:
            file_path = os.path.join(root_dir, file_name)
            if os.path.isfile(file_path):
                zipf.write(file_path, arcname=file_name)

        # Add directories recursively
        for dir_name in include_dirs:
            dir_path = os.path.join(root_dir, dir_name)
            if os.path.isdir(dir_path):
                for root, _, files in os.walk(dir_path):
                    for file in files:
                        full_path = os.path.join(root, file)
                        rel_path = os.path.relpath(full_path, root_dir)
                        # Skip unwanted directories
                        if any(ignored in rel_path for ignored in ["node_modules", ".git", ".cache", "dist"]):
                            continue
                        zipf.write(full_path, arcname=rel_path)

        # Include an INSTALL_WINDOWS.bat / instructions file specifically for the user
        instructions = """=============================================================
🇨🇭 SaaS Coursea - Job Matcher Suisse Romande
Installation dans : C:\\Users\\fabri\\Desktop\\Coursera\\SaaS_Coursea
=============================================================

1. Prérequis :
   - Node.js version 18 ou supérieure (https://nodejs.org)
   - npm (fourni avec Node.js)

2. Installation des dépendances :
   Dans l'invite de commande ou PowerShell dans ce dossier :
   npm install

3. Lancement du serveur de développement (Port 3000) :
   npm run dev

4. Accéder à l'application dans votre navigateur :
   http://localhost:3000

=============================================================
"""
        zipf.writestr("INSTALLATION_WINDOWS.txt", instructions)

    print(f"Archive generated at {output_path}")

if __name__ == "__main__":
    out = sys.argv[1] if len(sys.argv) > 1 else "/tmp/SaaS_Coursea_JobMatcher_Swiss.zip"
    create_project_zip(out)
