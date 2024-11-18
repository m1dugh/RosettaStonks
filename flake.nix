# vi: tabstop=2 shiftwidth=2
{
  description = "A development flake for rosetta stonks project";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/nixos-unstable";
    systems.url = "github:nix-systems/default";
    flake-utils = {
      url = "github:numtide/flake-utils";
      inputs.systems.follows = "systems";
    };
  };

  outputs =
    {
      nixpkgs,
      flake-utils,
      ...
    }:
    flake-utils.lib.eachDefaultSystem (
      system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
        inherit (nixpkgs) lib;
      in
      {
        devShells.default = pkgs.mkShell {
          nativeBuildInputs = with pkgs; [
            deno
            gnumake
            zip
          ];
        };

        packages = 
        let
          buildDenoPackage = {
            denoHash,
            pname,
            src,
            ...
          }@drv:
          let
            deno-cache = builtins.derivation {
              name = "deno-cache";
              src = ./.;
              inherit system;
              builder = 
              let
                builder = pkgs.writeShellScriptBin "builder" ''
                ${pkgs.coreutils}/bin/mkdir -p $out/cache/
                echo $src
                bite
                cd $src
                DENO_DIR="$out/cache/" ${lib.getExe pkgs.deno} install
                '';
              in "${lib.getExe builder}";

              outputHashMode = "recursive";
              outputHashAlgo = "sha256";
              outputHash = denoHash;
            };
          in pkgs.stdenv.mkDerivation ({
            inherit src;
            name = pname;

            preBuild = ''
              mkdir -p $out/
              cp -R ${deno-cache}/cache/ $out/cache
              chmod -R +w $out/cache/
              export DENO_DIR="$out/cache/"
            '';

            postBuild = ''
              rm -rf $out/cache/
            '';
          } // drv);
        in {
          mozilla = buildDenoPackage {
            pname = "rosettastonks.xpi";
            denoHash = "sha256-RK23SEW2uIfW9d4P+cYGI5nZ5o/1Nh5YJ6Ogkyiud/E=";
            src = ./.;

            nativeBuildInputs = with pkgs; [
              deno
              gnumake
              zip
            ];

            buildFlags = ["mozilla"];

            installPhase = ''
              runHook preInstall
              cp rosettastonks.xpi $out
              runHook postInstall
            '';

          };
          chrome = buildDenoPackage {

            pname = "rosettastonks-chrome";
            denoHash = "sha256-qPhzIYqoreMzLKNKKvUdGIPzPkied3qpZ9A6Di31OFE=";
            src = ./.;

            nativeBuildInputs = with pkgs; [
              deno
              gnumake
              zip
            ];

            buildFlags = ["chrome"];

            installPhase = ''
              runHook preInstall
              cp -R dist/ static/ manifest.json $out/
              runHook postInstall
            '';
          };
        };


        formatter = pkgs.nixfmt-rfc-style;
      }
    );
}
