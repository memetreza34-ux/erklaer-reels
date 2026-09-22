// Liest sichtbaren Text aus Reel-Bildern mit dem macOS-Vision-Framework.
//
// Warum nicht Tesseract: Tesseract ohne deutsches Sprachpaket liest
// "DIE STÄNDIGEN FÜNF" als "DIESTANDIGEN|FUNE". Für einen Gate, der geplanten
// deutschen Bildtext exakt gegen das gelieferte Bild prüft, ist das unbrauchbar.
// Vision liefert Umlaute und ß korrekt und ist auf jedem Mac vorhanden.
//
// Aufruf:   reel-ocr <bild> [<bild> ...]
// Ausgabe:  eine JSON-Zeile pro Bild: {"file":"...","lines":[...]} oder {"file":"...","error":"..."}

import AppKit
import Foundation
import Vision

func escape(_ value: String) -> String {
    var out = ""
    for scalar in value.unicodeScalars {
        switch scalar {
        case "\"": out += "\\\""
        case "\\": out += "\\\\"
        case "\n": out += "\\n"
        case "\r": out += "\\r"
        case "\t": out += "\\t"
        default:
            if scalar.value < 0x20 {
                out += String(format: "\\u%04x", scalar.value)
            } else {
                out.unicodeScalars.append(scalar)
            }
        }
    }
    return out
}

// Ein erkanntes Textstück mit seiner Lage im Bild. Die Lage wird gebraucht,
// weil Instagram und TikTok das untere Fünftel des Hochformats mit Caption und
// Buttons überdecken: Text, der dort steht, ist im Feed unlesbar.
struct Recognized {
    let text: String
    let left: Double
    let top: Double
    let right: Double
    let bottom: Double
}

func emit(file: String, items: [Recognized]?, error: String?) {
    guard let items else {
        print("{\"file\":\"\(escape(file))\",\"error\":\"\(escape(error ?? "unbekannter Fehler"))\"}")
        return
    }
    let lines = items.map { "\"\(escape($0.text))\"" }.joined(separator: ",")
    let boxes = items.map {
        String(format: "{\"text\":\"%@\",\"left\":%.4f,\"top\":%.4f,\"right\":%.4f,\"bottom\":%.4f}",
               escape($0.text), $0.left, $0.top, $0.right, $0.bottom)
    }.joined(separator: ",")
    print("{\"file\":\"\(escape(file))\",\"lines\":[\(lines)],\"boxes\":[\(boxes)]}")
}

let paths = Array(CommandLine.arguments.dropFirst())
if paths.isEmpty {
    FileHandle.standardError.write("Aufruf: reel-ocr <bild> [<bild> ...]\n".data(using: .utf8)!)
    exit(64)
}

for path in paths {
    guard let image = NSImage(contentsOfFile: path),
          let cgImage = image.cgImage(forProposedRect: nil, context: nil, hints: nil) else {
        emit(file: path, items: nil, error: "Bild konnte nicht gelesen werden")
        continue
    }

    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["de-DE", "en-US"]
    // Sprachkorrektur würde geplante Headlines stillschweigend "verbessern" und
    // damit genau den Unterschied verwischen, den dieser Gate finden soll.
    request.usesLanguageCorrection = false

    do {
        try VNImageRequestHandler(cgImage: cgImage, options: [:]).perform([request])
        let items: [Recognized] = (request.results ?? []).compactMap { observation in
            guard let candidate = observation.topCandidates(1).first else { return nil }
            // Vision misst normalisiert mit Ursprung UNTEN links; hier wird auf
            // "oben links = 0" umgerechnet, wie es der Rest der Pipeline nutzt.
            let box = observation.boundingBox
            return Recognized(
                text: candidate.string,
                left: Double(box.minX),
                top: Double(1 - box.maxY),
                right: Double(box.maxX),
                bottom: Double(1 - box.minY)
            )
        }
        emit(file: path, items: items, error: nil)
    } catch {
        emit(file: path, items: nil, error: "\(error)")
    }
}
