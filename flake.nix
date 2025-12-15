{
  description = "Veilingproject – Next.js + .NET 9 + PostgreSQL";

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
            # Frontend
            nodejs_22
            nodePackages.typescript-language-server
            nodePackages.prettier
            nodePackages.vscode-langservers-extracted

            # Backend
            dotnet-sdk_9
            dotnet-ef
            omnisharp-roslyn
            netcoredbg

            # Docker + PostgreSQL
            docker
            docker-compose
            postgresql

            # General
            git
            jq
          ];

          # This is the magic line
          shellHook = ''
            export PATH="$PATH:./frontend/node_modules/.bin"
            export PATH="$PATH:./backend/node_modules/.bin"  # if you ever have CLI tools there

            echo ""
            echo "Veilingproject ready!"
            echo "Frontend: cd frontend && npm install && npm run dev"
            echo "Backend:  cd backend && dotnet watch"
            echo ""
          '';
        };
      }
    );
}
