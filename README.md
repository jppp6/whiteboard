# Interactive Whiteboard App

A modern, digital whiteboard application built with Angular 19 & Supabase, designed for use with smart boards in educational settings.
This app allows teachers to create, save, and organize interactive content through an intuitive and simple interface.

## Features

### Widgets

-   Rich text editor

### Interface

-   Clean, minimalist design focused on content creation
-   Drag-and-drop functionality for easy content organization
-   Responsive layout that adapts to different screen sizes
-   Touch-optimized controls for smart board use

### Content Management

-   Save and load whiteboard sessions
-   Organize content into separate boards

## Usage Guide

### Getting Started

1. Create a new board by clicking the "+" button on /whiteboards
2. Select your desired tool from the toolbar
3. Organize and create as you please

### Saving Your Work

-   Changes are automatically saved in real-time
-   Access previous boards from the whiteboards page

## Project Structure

```
src/
├── environments/
└── app/
    ├── core/
    │   └── layout/
    │   └── services/
    │   └── utils/
    ├── pages/
    │   ├── account
    │   ├── canvas
    │   ├── login
    │   └── selector
    └── widgets/
        ├── chart
        ├── checklist
        ├── countdown
        ├── date-time
        ├── sticker
        ├── text
        └── countodnvideo

```

## Contributing

While this project was initially created as a personal tool, contributions are welcome.
Please feel free to submit pull requests or create issues for any bugs you find or features you'd like to suggest.

## Acknowledgments

Special thanks to my girlfriend for inspiring this project and providing valuable feedback during development.
Her input as an educator helped shape the features and user interface to be more practical for classroom use.

# Run this for the Github Pages deployment

```bash
ng build --output-path docs --base-href /whiteboard/
```

Then move /browser/_ to /_
