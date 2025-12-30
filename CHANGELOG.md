# Changelog

All notable changes to the "Bar Los Hermanos" project will be documented in this file.

## [Unreleased] - 2025-12-30

### Added
- **Menu Section Redesign**: Implemented a new asymmetrical grid layout for the Menu section to better showcase items.
    - Added a fixed sidebar with the "Nossa Cozinha" kicker and specific beer list (Heineken, Original, Stella, Corona, Spaten, Brahma).
    - Added a "Ver Cardápio Completo" button linking to `assets/menu/cardapio-completo.pdf` with a rounded style.
    - Added two distinct columns for content: one for **Drinks** (Caipirinha, Gin, etc.) and one for **Food** (Jiló, Costelinha, etc.), both with 6 items and short descriptions.
- **Section Title Standardization**: Unified visual style for section headers.
    - Kickers (e.g., "Nossa Essência") are now Red (`#ff3131`).
    - Main Titles (e.g., "TRADIÇÃO E SABOR EM GV") are now White (`#fff`) and formatted to `4rem`.

### Changed
- **Color Palette Updates**:
    - Updated `#menu` background color to `#081211` to match the Reservation section.
    - Updated `.event-card` background color to `#081211` for consistency.
- **Typography**:
    - Adjusted font sizes in the menu section for better information density.
- **Assets**:
    - Replaced Hero video references (swapped positions of chef and drinks videos).

### Fixed
- Fixed inconsistent button rounding in the menu section to match the global site style (`border-radius: 50px`).
