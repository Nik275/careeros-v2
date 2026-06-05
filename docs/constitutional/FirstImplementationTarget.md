# Wave 3.3.5 - First Implementation Target

## 1. Single Safest Implementation Step

Recommended first implementation target:

```text
Read-only Constitutional Ownership Registry and Observe-Mode Validator
```

This is the safest first target because it delivers immediate constitutional value without changing production behavior.

## 2. Why This Target Comes First

The repository is not ready to route traffic through `IntelligenceOrchestrator` or wrap production callers with authority facades. It is ready to make the existing ownership map machine-readable and observable.

This target:

- Does not change runtime product behavior.
- Does not redirect traffic.
- Does not move files.
- Does not delete files.
- Does not merge duplicate systems.
- Does not block production paths.
- Gives engineering teams a concrete baseline for all later waves.

## 3. Scope

The first implementation target should include:

1. A machine-readable ownership registry derived from `Wave3_3_IntelligenceOwnershipMap.md`.
2. Registry entries for all 444 discovered intelligence files.
3. Authority owner for each file:
   - `StudentUnderstandingAuthority`
   - `OptionGeneratorAuthority`
   - `OutcomeTrackerAuthority`
4. Classification for:
   - authority internal
   - public surface
   - shared-neutral
   - test-only
   - legacy-shadow
5. Capability tags:
   - UNDERSTAND
   - GENERATE
   - LEARN
   - ORCHESTRATE
   - DECIDE
   - CONFIDENCE
6. A read-only import graph validator in observe mode.
7. A report showing:
   - 444 mapped intelligence files.
   - 4 direct cross-authority imports.
   - 393 non-owned direct imports into owned systems.
   - 131 non-owned transitive authority reach paths.
   - public multi-authority surfaces.
   - unowned new intelligence files.

## 4. Explicit Non-Scope

This first target must not include:

- Production traffic redirection.
- Runtime blocking.
- Authority facade command execution.
- Moving files.
- Deleting files.
- Merging duplicate clusters.
- Deprecating public barrels.
- Changing recommendation outputs.
- Changing assessment outputs.
- Changing outcome writes.

## 5. Value Delivered

| Value | Why it matters |
| --- | --- |
| Turns markdown ownership into machine-checkable ownership | Prevents drift and supports CI later |
| Establishes 444-file baseline | Gives all teams a stable migration scope |
| Reports direct violations | Makes the 4 direct cross-authority imports visible in tooling |
| Identifies shadow access paths | Prepares for safe facade and orchestrator rollout |
| Supports future orchestrator policy | Registry becomes input to route validation |
| Does not affect production users | Lowest operational risk |

## 6. Validation Strategy

Validation should prove:

- Registry contains exactly 444 intelligence file entries.
- Authority counts match:
  - 50 `StudentUnderstandingAuthority`
  - 339 `OptionGeneratorAuthority`
  - 55 `OutcomeTrackerAuthority`
- Direct forbidden import report matches the known 4 current imports.
- Registry can run without changing production behavior.
- Report output is deterministic.
- False positives can be reviewed without blocking merge.

## 7. Rollback Strategy

Rollback is simple because this target is read-only:

- Disable validator reporting.
- Remove CI/report invocation if noisy.
- Keep registry artifact versioned for future correction.
- No production behavior rollback required.

## 8. Risk Level

Risk:

```text
Low
```

Potential risks:

- False positives from import resolution.
- Registry drift if ownership docs change.
- Team confusion if observe reports are treated as blocking too early.

Mitigations:

- Run in observe mode only.
- Label results as advisory.
- Version registry with source document references.
- Require human review before promotion to warn/block.

## 9. Success Criteria

The first implementation target is successful when:

1. The 444-file ownership baseline is machine-readable.
2. Current known violation counts are reproducible.
3. New intelligence files can be detected as unowned.
4. No production behavior changes.
5. No source traffic path changes.
6. Engineering teams can use the report before building facades.

## 10. First Target Verdict

The single safest first implementation step is not the orchestrator runtime itself. It is the read-only ownership registry and observe-mode validator that makes the orchestrator possible.

After this succeeds, the next safe target is source-level authority/orchestrator contracts in observe mode.
