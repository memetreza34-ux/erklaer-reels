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
    request.usesLanguageCorrection = false

    do {
        try VNImageRequestHandler(cgImage: cgImage, options: [:]).perform([request])
        let items: [Recognized] = (request.results ?? []).compactMap { observation in
            guard let candidate = observation.topCandidates(1).first else { return nil }
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
