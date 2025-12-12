{
  description = "Veilingproject – Next.js (React + TS) + .NET 9 + PostgreSQL";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs =
    {
      self,
      nixpkgs,
      flake-utils,
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            # ── Frontend: React + Next.js + TypeScript ─────────────────────
            nodejs_22 # Latest stable (npm included)
            nodePackages.npm # Explicit npm (just in case)
            nodePackages.typescript
            nodePackages.typescript-language-server # TS/JS LSP
            nodePackages.prettier
            nodePackages.vscode-langservers-extracted # HTML/CSS/JSON/ESLint

            # ── Backend: .NET 9 ─────────────────────────────────────────────
            dotnet-sdk_9 # .NET 9.0 SDK (latest)
            omnisharp-roslyn # C# LSP for Neovim
            netcoredbg # .NET debugger (optional)

            # ── Database & Infrastructure ───────────────────────────────────
            docker-compose
            postgresql # gives you `psql`

            # ── General tools ───────────────────────────────────────────────
            git
            curl
            jq
          ];

          shellHook = ''
            echo ""
            echo "Veilingproject Dev Environment"
            echo "Frontend → npm run dev          (in frontend/)"
            echo "Backend  → dotnet watch run     (in backend/)"
            echo "DB       → docker-compose up -d"
            echo ""
            echo "Node $(node --version)  •  npm $(npm --version)  •  .NET $(dotnet --version)"
            echo ""
          '';
        };
      }
    );
}
