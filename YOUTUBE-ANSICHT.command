#!/bin/bash
# Nur die Finder-Ansicht aufraeumen; Dateien nie verschieben oder loeschen.
set -euo pipefail

mode="hide"
dry_run=0
usage() {
  cat <<'HELP'
Weltlogik – aufgeraeumte macOS-Finder-Ansicht
  Doppelklick: im Repo nur youtube/, darin nur Kalenderwochen.
  --hide       Technische Dateien in Finder ausblenden
  --show       Alles vom Skript Ausgeblendete wieder einblenden
  --dry-run    Vorschau ohne Dateiaenderungen
  --help       Hilfe anzeigen

Kein Verschieben, Umbenennen oder Loeschen. Git und Tools arbeiten normal.
HELP
}
for arg in "$@"; do
  case "$arg" in
    --hide) mode="hide" ;;
    --show|--restore|--rueckgaengig) mode="show" ;;
    --dry-run) dry_run=1 ;;
    --help|-h) usage; exit 0 ;;
    *) printf 'Unbekannte Option: %s\n' "$arg" >&2; usage >&2; exit 2 ;;
  esac
done

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
# Ein externes Testverzeichnis ist NUR im read-only Vorschaumodus erlaubt.
if [ "$dry_run" -eq 1 ] && [ -n "${YOUTUBE_VIEW_TEST_ROOT:-}" ]; then
  repo_root="$(cd "$YOUTUBE_VIEW_TEST_ROOT" && pwd -P)"
fi
if [ ! -d "$repo_root/youtube" ]; then
  printf 'ABBRUCH: youtube/-Ordner fehlt in %s.\n' "$repo_root" >&2
  exit 2
fi
if [ "$dry_run" -eq 0 ] && [ "$(uname -s)" != "Darwin" ]; then
  printf 'ABBRUCH: Diese Finder-Ansicht funktioniert nur auf macOS.\n' >&2
  exit 2
fi

git_dir="$(git -C "$repo_root" rev-parse --absolute-git-dir 2>/dev/null || true)"
if [ "$dry_run" -eq 0 ] && [ -z "$git_dir" ]; then
  printf 'ABBRUCH: Kein lokales Git-Arbeitsverzeichnis. Keine Aenderung erfolgt.\n' >&2
  exit 2
fi
state_file="${git_dir:-$repo_root/.git}/finder-youtube-ansicht-versteckt.bin"
changed=0

already_hidden() {
  local flags
  flags="$(stat -f '%Sf' "$1" 2>/dev/null || true)"
  case "$flags" in *hidden*) return 0 ;; *) return 1 ;; esac
}

hide_one() {
  local absolute="$1"
  local relative="${absolute#"$repo_root"/}"
  if already_hidden "$absolute"; then return; fi
  printf 'AUSBLENDEN: %s\n' "$relative"
  if [ "$dry_run" -eq 0 ]; then
    chflags hidden "$absolute"
    # Speicher im Git-Verzeichnis: nur vorher sichtbare, selbst ausgeblendete Pfade.
    printf '%s\0' "$relative" >> "$state_file"
  fi
  changed=$((changed + 1))
}

if [ "$mode" = "show" ]; then
  if [ ! -f "$state_file" ]; then
    printf 'Keine zuvor ausgeblendeten Elemente gefunden.\n'
    exit 0
  fi
  while IFS= read -r -d '' relative; do
    # Ausschliesslich Root-Kinder und direkte youtube/-Kinder ruecksetzen.
    case "$relative" in
      /*|../*|*/../*|youtube|.git*|"") continue ;;
      */*) case "$relative" in youtube/*) ;; *) continue ;; esac ;;
    esac
    absolute="$repo_root/$relative"
    if [ -e "$absolute" ] || [ -L "$absolute" ]; then
      printf 'EINBLENDEN: %s\n' "$relative"
      if [ "$dry_run" -eq 0 ]; then chflags nohidden "$absolute"; fi
      changed=$((changed + 1))
    fi
  done < "$state_file"
  if [ "$dry_run" -eq 0 ]; then rm "$state_file"; fi
  printf 'Fertig: %s Elemente wieder sichtbar. Nichts geloescht.\n' "$changed"
  exit 0
fi

printf 'FINDER: youtube/ und Wochenordner bleiben sichtbar.\n'
printf 'SICHTBAR: youtube/\n'

# Nur die oberste Verzeichnisebene; dot-Dateien (.git etc.) bleiben unberuehrt.
for item in "$repo_root"/*; do
  if [ ! -e "$item" ] && [ ! -L "$item" ]; then continue; fi
  name="${item##*/}"
  if [ "$name" = "youtube" ]; then continue; fi
  hide_one "$item"
done

# In youtube bleiben NUR KW-Ordner sichtbar. Keine Aenderung IN Videoprojekten.
for item in "$repo_root"/youtube/*; do
  if [ ! -e "$item" ] && [ ! -L "$item" ]; then continue; fi
  name="${item##*/}"
  if [ -d "$item" ] && [[ "$name" =~ ^[0-9]{4}-KW[0-9]{2}_.+ ]]; then
    printf 'SICHTBAR: youtube/%s/\n' "$name"
    continue
  fi
  hide_one "$item"
done

if [ "$dry_run" -eq 1 ]; then
  printf '\nVORSCHAU – nichts veraendert.\n'
else
  printf '\nFertig: %s technische Elemente im Finder ausgeblendet.\n' "$changed"
  printf 'Finder-Fenster kurz schliessen und wieder oeffnen.\n'
  printf 'Falls versteckte Dateien angezeigt werden: Cmd+Shift+Punkt im Finder.\n'
  printf 'Rueckgaengig im Projektordner: bash ./YOUTUBE-ANSICHT.command --show\n'
fi
