enum DiagnosticSeverity {
	Error = 1,
	Warning = 2,
	Information = 3,
	Hint = 4,
}

interface Diagnostic {
	code: string,
	codeDescription: {
		href: string
	},
	message: string,
	range: {
		start: {
			line: number,
			character: number
		},
		end: {
			line: number,
			character: number
		}
	},
	severity: DiagnosticSeverity,
	source: string
}

export function setDiagnostics(diagnostics: Diagnostic[]) {
	var error = 0
	var warning = 0
	var information = 0
	var hint = 0

	for (let diagnostic of diagnostics) {
		console.log(diagnostic.message, diagnostic.severity, diagnostic.range)
		switch (diagnostic.severity) {
			case DiagnosticSeverity.Error:
				error += 1
			break
			case DiagnosticSeverity.Warning:
				warning += 1
			break
			case DiagnosticSeverity.Information:
				information += 1
			break
			case DiagnosticSeverity.Hint:
				hint += 1
			break
		}
	}

	document.getElementById("lspProgress")!.textContent = `${error} errors, ${warning} warnings, ${information} information, ${hint} hints`
}
