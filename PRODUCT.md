# CricOS — Product Specification

## Mission
CricOS is the unified operating system for recreational, club, and professional cricket ecosystems. It integrates tournament scheduling, instant provider marketplace booking (grounds, umpires, scorers, commentators), ball-by-ball live scoring compliant with MCC Laws, and double-entry financial settlements.

## Core Personas
1. **Organizers / Tournament Directors**: Creates tournaments, configures fixture brackets, books service slots, monitors match operations.
2. **Captains & Players**: Manages squads, sets availability, submits lineups, reviews player statistics and ratings.
3. **Providers (Umpires, Scorers, Grounds, Streamers)**: Lists availability slots, manages rates, receives automated escrows and payouts.
4. **Scorers & Umpires**: Inputs live match events with dynamic strike rotation, validates scorecards, files match incident reports.

## Core Capabilities
- **Commercial & Settlement**: Integer minor-unit pricing with automated platform fee and tax calculation; double-entry financial ledger guaranteeing zero-sum balance.
- **Scoring & Cricket Laws**: Full compliance with official MCC Laws of Cricket (strike rotation, bowler figures, extras accounting, maiden tracking, fall of wickets).
- **Incident & Reputation Management**: Operational dispute logging, automated replacement matching, and reputation scoring.
- **Provider Booking**: Temporal collision prevention via PostgreSQL GiST exclusion constraints.
