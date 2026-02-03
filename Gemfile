# frozen_string_literal: true

source "https://rubygems.org"

# For GitHub Pages compatibility - use github-pages gem which includes all needed dependencies
gem "github-pages", group: :jekyll_plugins

# Note: jekyll-seo-tag, jekyll-sitemap, and jemoji are already included in github-pages
# But we list them explicitly for clarity and to ensure they're available
gem "jekyll-seo-tag"
gem "jekyll-sitemap"
gem "jemoji"

# For local development only
# https://github.com/jekyll/jekyll/issues/8523#issuecomment-751409319
# When running locally, we run into the following error —
# `require': cannot load such file -- webrick (LoadError)
# adding this avoids it
gem "webrick", "~> 1.7"
