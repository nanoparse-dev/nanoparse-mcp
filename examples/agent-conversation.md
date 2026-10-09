# Worked example: an agent reading an academic paper

This is a real `nanoparse_fetch` round-trip against the hosted endpoint
(`https://nanoparse.app/mcp`), showing what the agent sees and how it reasons
over the Litmus signals. The full response JSON is in
[`example-output.json`](./example-output.json).

## The request

```
You: Fetch https://arxiv.org/abs/2401.14295 and tell me what this paper
     claims, and whether I can trust it as a source.
```

The agent calls `nanoparse_fetch(url: "https://arxiv.org/abs/2401.14295")`
and receives clean Markdown plus the Litmus object — before reading a single
word of the paper.

## What Litmus told the agent, up front

```json
{
  "litmus": {
    "source": {
      "type": "academic",
      "authority": 0.85,
      "rationale": "academic source"
    },
    "freshness": {
      "published": null,
      "age": "unknown",
      "stale_warning": "No publish date found — verify independently"
    },
    "tldr": "Abstract page for arXiv paper 2401.14295: Demystifying Chains, Trees, and Graphs of Thoughts",
    "key_figures": [
      { "value": "2,247", "context": "Thu, 25 Jan 2024 16:34:00 UTC (2,247 KB)" },
      { "value": "2,290", "context": "Sat, 30 Mar 2024 16:36:33 UTC (2,290 KB)" }
    ],
    "structural_trust_score": {
      "level": "medium",
      "trust_factors": [
        "High-authority source",
        "No publish date found — verify independently"
      ]
    },
    "content_type": "academic_paper",
    "reading_time": { "minutes": 4 },
    "hedge_language": { "density": "low", "markers_found": 0, "per_500_words": 0 },
    "syndication": { "detected": false },
    "paywall": { "detected": false }
  }
}
```

## How the agent reasons about it

- **Structural trust: medium** — Litmus flags this as high-authority
  (academic, 0.85) but with no publish date found, so the verdict is "verify
  independently," not "trust blindly." The agent treats it as a solid source
  it still needs to date-check.
- **Authority 0.85, academic** — high-trust source class. Claims from this
  paper can be weighed accordingly. (Litmus scores the *source class*, not
  the truth of the content — the agent still reads and thinks.)
- **Freshness warning** — no publish date on the abstract page. The agent
  checks the arXiv listing in the markdown and finds version dates
  (Jan 2024 → Feb 2025), so it cites the paper as "2024, updated 2025"
  instead of guessing.
- **Key figures** — file sizes are noise, so the agent ignores them; but it
  now knows the paper exists in multiple revisions.
- **No syndication, no paywall, low hedge density, 4-minute read** — a
  clean, direct academic source. No red flags.

## The agent's answer

> The paper **"Demystifying Chains, Trees, and Graphs of Thoughts"**
> (arXiv 2401.14295) compares chain-of-thought, tree-of-thought, and
> graph-of-thought prompting across 12 datasets. It claims tree/graph
> reasoning does not consistently beat plain chain-of-thought, and that
> success depends on problem type and search strategy.
>
> Source note: academic (authority 0.85), first posted Jan 2024 with
> revisions through Feb 2025. No paywall or syndication flags. Solid
> source for a research summary; treat its negative claims about
> tree-of-thought as one study, not settled consensus.

That reasoning — *"can I trust this, how fresh is it, what kind of source
is it, is there anything to verify"* — is exactly what Litmus pre-computes
so the agent doesn't have to guess from raw text.
