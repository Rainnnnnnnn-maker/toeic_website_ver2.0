---
name: "sort-words-alphabetically"
description: "Sorts word.txt, word_mid.txt, and word_high.txt alphabetically. Removes 'number→' prefixes. Checks format consistency."
---

# Sort Words Alphabetically

This skill sorts the contents of `__words__/word.txt`, `__words__/word_mid.txt`, and `__words__/word_high.txt` alphabetically. It also ensures that each line contains only the word, removing any numeric prefixes like `1→`.

## Capabilities

1.  **Sorting**: Sorts words in alphabetical order (case-insensitive).
2.  **Cleaning**: Removes numeric prefixes (e.g., `1→word` becomes `word`).
3.  **Validation**: Verifies that the final files do not contain numeric prefixes.

## Usage Instructions

When invoked:

1.  Read the contents of `__words__/word.txt`, `__words__/word_mid.txt`, and `__words__/word_high.txt`.
2.  For each file:
    a.  Parse each line.
    b.  Remove any prefix matching the regex `^\d+→`.
    c.  Trim whitespace.
    d.  Remove empty lines.
    e.  Sort the lines alphabetically (case-insensitive).
    f.  Write the sorted, cleaned content back to the file.
3.  After writing, re-read the files to verify:
    -   No lines start with a number followed by `→`.
    -   The file is sorted.
4.  Report the results to the user, confirming successful sorting and cleaning.

## File Paths

-   `__words__/word.txt`
-   `__words__/word_mid.txt`
-   `__words__/word_high.txt`
