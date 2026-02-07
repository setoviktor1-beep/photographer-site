# Aura Studio - Photographer Portfolio

A premium, minimalist photography portfolio template built with vanilla HTML, Tailwind CSS, and JavaScript. Ready for deployment on GitHub Pages.

## Project Structure

```text
photographer-site/
  index.html        # Home page
  portfolio.html    # Filterable gallery & lightbox
  services.html     # Pricing & FAQ accordion
  about.html        # Bio & philosophy
  contact.html      # Booking form
  assets/
    img/            # Place images here
    favicon/        # Favicon files
  js/
    main.js         # Interactivity (Menu, Filter, Lightbox, etc.)
  README.md
```

## How to Customize

1. **Name/Brand**: Search and replace `AURA STUDIO` in all HTML files.
2. **Contact Email**: Update `hello@aurastudio.com` in `js/main.js` and `contact.html`.
3. **Images**: 
   - Place your photos in `assets/img/`.
   - Name them according to the `src` tags in the HTML (e.g., `hero.jpg`, `portfolio-01.jpg`).
   - The UI includes graceful placeholders, so it will render even if images are missing.

## Local Preview

You can view the site by opening `index.html` in any browser. For a better experience, run a local server:

**Using Python:**
```bash
python -m http.server 8000
```
Then visit `http://localhost:8000`.

## Deployment (GitHub Pages)

1. Create a new repository on GitHub.
2. Push this folder to the `main` branch.
3. Go to **Settings -> Pages**.
4. Select **Deploy from a branch**.
5. Choose `main` and `/ (root)`.
6. Click **Save**.

## Features

- **Responsive Design**: Mobile-first approach using Tailwind CSS.
- **Interactive Gallery**: Category-based filtering and fullscreen lightbox.
- **Editorial Typography**: Using Fraunces and Inter Google Fonts.
- **Glassmorphism**: Modern UI elements with backdrop blurs.
- **FAQ Accordion**: Built with vanilla JS for fast performance.
- **Contact Form**: Integrates with system `mailto:` for lead delivery.
