# React-Only Recipe Authoring Application - Phased Implementation Plan

## Overview

Goal: Build a frontend-only React application that behaves like a
lightweight AEM-style authoring platform for a recipe website.

The application will support:

-   Public recipe browsing
-   Recipe pages rendered from structured JSON content
-   An author mode for non-technical users
-   Component-based page building
-   Local content storage/export
-   Static deployment workflow

Architecture:

    Author Mode
        |
        v
    Recipe Builder
        |
        v
    JSON Content Files
        |
        v
    React Renderer
        |
        v
    Static Website Deployment

------------------------------------------------------------------------

# Phase 1 - Project Foundation

## Objectives

Create the React application foundation and establish the core
architecture.

## Tasks

-   Create React project using Vite
-   Configure routing
-   Add styling framework
-   Create application folder structure

Suggested structure:

    src/
     ├── components/
     ├── pages/
     ├── recipes/
     ├── author/
     ├── renderer/
     └── utils/

## Deliverables

-   Running React application
-   Home page route
-   Recipe route
-   Author route placeholder

------------------------------------------------------------------------

# Phase 2 - Recipe Content Model

## Objectives

Create the structured content format that replaces a traditional CMS
database.

## Tasks

Define recipe JSON schema.

Example:

``` json
{
  "title": "Recipe Name",
  "slug": "recipe-name",
  "image": "/images/example.jpg",
  "blocks": [
    {
      "type": "ingredients",
      "data": {}
    }
  ]
}
```

Create:

-   Recipe loader
-   Recipe validation
-   Recipe indexing

## Deliverables

-   Recipes stored as JSON files
-   React can load recipes dynamically

------------------------------------------------------------------------

# Phase 3 - Public Recipe Experience

## Objectives

Build the user-facing website.

## Tasks

Create:

-   Homepage
-   Recipe listing
-   Recipe detail pages
-   Search/filter capability
-   Recipe categories

Create reusable components:

    RecipeHero
    Ingredients
    Instructions
    Nutrition
    Gallery
    Notes

## Deliverables

Visitors can browse recipes.

------------------------------------------------------------------------

# Phase 4 - Component Rendering Engine

## Objectives

Create the AEM-style component architecture.

## Tasks

Create component registry:

    {
     hero: HeroComponent,
     ingredients: IngredientsComponent,
     instructions: InstructionsComponent
    }

Build dynamic renderer:

    Recipe JSON
          |
          v
    Block Renderer
          |
          v
    React Components

## Deliverables

Recipes render dynamically based on content blocks.

------------------------------------------------------------------------

# Phase 5 - Author Mode Foundation

## Objectives

Create the non-technical editing experience.

## Tasks

Build:

-   Author dashboard
-   Recipe creation form
-   Recipe editing interface
-   Live preview

Features:

-   Change title
-   Upload/select image references
-   Edit ingredients
-   Edit instructions

## Deliverables

Owner can create recipes visually.

------------------------------------------------------------------------

# Phase 6 - Visual Page Builder

## Objectives

Add AEM-style component authoring.

## Tasks

Implement:

-   Component palette
-   Drag/drop ordering
-   Add/remove blocks
-   Edit component properties

Example:

    Available Components

    + Hero
    + Ingredients
    + Steps
    + Gallery


    Current Page

    Hero
    Ingredients
    Steps

## Deliverables

Users can build recipes from reusable blocks.

------------------------------------------------------------------------

# Phase 7 - Local Persistence

## Objectives

Allow editing without a backend.

## Tasks

Add:

-   localStorage saving
-   Import/export JSON
-   Backup files

Workflow:

    Edit Recipe
          |
          v
    Save Locally
          |
          v
    Export JSON
          |
          v
    Add To Project

## Deliverables

Author content can be saved and transferred.

------------------------------------------------------------------------

# Phase 8 - Publish Workflow

## Objectives

Create a simple publishing experience.

## Tasks

Build:

-   Publish button
-   Export generator
-   Content validation

Publishing flow:

    Author
      |
      v
    Publish
      |
      v
    Generate JSON
      |
      v
    Deploy Static Site

## Deliverables

Owner can publish recipes without touching code.

------------------------------------------------------------------------

# Phase 9 - Deployment

## Objectives

Deploy the static React application.

## Tasks

Configure:

-   Production build
-   Hosting
-   Image handling
-   SEO metadata

Potential platforms:

-   Vercel
-   Netlify
-   GitHub Pages

## Deliverables

Public recipe website online.

------------------------------------------------------------------------

# Phase 10 - Future Backend Migration Path

If requirements expand:

-   Multiple authors
-   Cloud editing
-   Drafts
-   Version history
-   Scheduled publishing

Replace:

    recipes/*.json

with:

    Database API

Keep:

-   Component registry
-   Renderer
-   Author interface

Only the content storage layer changes.

------------------------------------------------------------------------

# Recommended Build Order

1.  React foundation
2.  Recipe JSON model
3.  Public recipe renderer
4.  Component system
5.  Author editor
6.  Drag/drop builder
7.  Export workflow
8.  Deployment

This approach delivers a lightweight AEM-like experience without
requiring a backend.
