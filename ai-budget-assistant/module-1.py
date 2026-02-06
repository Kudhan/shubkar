# AI Powered Code Reviewer
# Module - 1 :  Code Parsing & Analysis

import os
import ast
import csv

# File Handling

def get_python_files(folder_path):
    py_files = []

    for root, _, files in os.walk(folder_path):
        for file in files:
            if file.endswith(".py"):
                py_files.append(os.path.join(root, file))

    return py_files


def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


# Parser + Structure Analysis

def extract_structure(tree):
    structure = {
        "imports": [],
        "functions": [],
        "classes": [],
        "loops": 0,
        "conditionals": 0
    }

    for node in ast.walk(tree):

        if isinstance(node, ast.Import):
            for name in node.names:
                structure["imports"].append(name.name)

        elif isinstance(node, ast.ImportFrom):
            structure["imports"].append(node.module)

        elif isinstance(node, ast.FunctionDef):
            structure["functions"].append(node.name)

        elif isinstance(node, ast.ClassDef):
            structure["classes"].append(node.name)

        elif isinstance(node, (ast.For, ast.While)):
            structure["loops"] += 1

        elif isinstance(node, ast.If):
            structure["conditionals"] += 1

    return structure



# Complexity Metrics


def cyclomatic_complexity(tree):
    complexity = 1

    for node in ast.walk(tree):
        if isinstance(node, (ast.If, ast.For, ast.While, ast.Try, ast.BoolOp)):
            complexity += 1

    return complexity



# Code Smells


def detect_smells(tree):
    issues = []

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef):

            # Long function
            length = len(node.body)
            if length > 20:
                issues.append(f"Long function '{node.name}' ({length} lines)")

            # Too many parameters
            if len(node.args.args) > 5:
                issues.append(f"Too many parameters in '{node.name}'")

            # Missing docstring
            if not ast.get_docstring(node):
                issues.append(f"Missing docstring in '{node.name}'")

        # Nesting Check
        if isinstance(node, (ast.For, ast.While, ast.If)):
            depth = get_depth(node)
            if depth > 3:
                issues.append("Deep nesting detected")

    return issues


def get_depth(node):
    depth = 0
    current = node

    while hasattr(current, "body") and current.body:
        depth += 1
        current = current.body[0]

    return depth



# Sevearity Classification


def classify_severity(complexity, smell_count):
    if complexity > 10 or smell_count > 5:
        return "ERROR"
    elif complexity > 5 or smell_count > 2:
        return "WARNING"
    else:
        return "INFO"

# File Analysis


def analyze_file(filepath):
    print("\n======================================")
    print("Analyzing:", filepath)

    code = read_file(filepath)
    tree = ast.parse(code)

    structure = extract_structure(tree)
    complexity = cyclomatic_complexity(tree)
    smells = detect_smells(tree)
    severity = classify_severity(complexity, len(smells))

    print("Structure:", structure)
    print("Complexity:", complexity)
    print("Severity:", severity)

    print("Issues:")
    if smells:
        for s in smells:
            print(" -", s)
    else:
        print(" - No issues")

    return {
        "file": filepath,
        "functions": len(structure["functions"]),
        "classes": len(structure["classes"]),
        "complexity": complexity,
        "smells": len(smells),
        "severity": severity
    }



# Csv Report

def export_csv(results, filename="report.csv"):
    keys = results[0].keys()

    with open(filename, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(results)

    print("\nCSV report saved as:", filename)


# Main Project Analysis


def analyze_project(folder_path):
    files = get_python_files(folder_path)

    if not files:
        print("No python files found.")
        return

    print(f"\nFound {len(files)} python files\n")

    results = []

    for file in files:
        result = analyze_file(file)
        results.append(result)

    export_csv(results)



if __name__ == "__main__":
    analyze_project("/content")
