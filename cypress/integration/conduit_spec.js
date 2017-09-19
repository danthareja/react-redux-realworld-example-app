describe('Conduit', function() {

  context('Home Page', function() {

    beforeEach(function(){
      cy.server()

      cy.fixture('articles').as('articles')
      cy.fixture('tags').as('tags')

      cy.route('GET', '/api/articles*', '@articles')
      cy.route('GET', '/api/tags', '@tags')

      // Visiting our app before each test removes any state build up from
      // previous tests. Visiting acts as if we closed a tab and opened a fresh one
      // An empty string defers to baseUrl found in cypress.json
      cy.visit('')
    })

    it('should render a banner', function() {
      cy.get('div.home-page').find('div.banner').within(function() {
        cy.get('div.container').within(function() {
          cy.get('h1.logo-font').should('have.text', 'conduit')
          cy.get('p').should('have.text', 'A place to share your knowledge.')
        })
      })
    })

    it('should render a layout with a single row and two columns', function() {
      cy.get('div.home-page').find('div.container.page').within(function() {
        cy.get('div.row').within(function() {
          cy.get('.col-md-9')
          cy.get('.col-md-3')
        })
      })
    })

    it('should render a feed of articles in the left column', function() {
      cy.get('div.home-page').find('div.col-md-9').within(function() {
        cy.get('div.article-preview')
          .should('have.length', this.articles.articlesCount)
          .each(function($el, i) {
            const article = this.articles.articles[i]
            cy.wrap($el).within(function() {
              cy.get('div.article-meta').within(function() {
                cy.get('a').within(function() {
                  cy.get('img').should('have.attr', 'src', article.author.image)
                })
                cy.get('div.info').within(function() {
                  cy.get('a.author').should('have.text', article.author.username)
                  cy.get('span.date').should(
                    'have.text',
                    Cypress.moment(article.createdAt).format('ddd MMM DD YYYY')
                  )
                })
                // TODO: Fix implementation so we can use more explict 'have.text' matcher
                cy.get('button.btn').should('contain', article.favoritesCount)
                cy.get('button.btn').within(function() {
                  cy.get('i.ion-heart')
                })
              })
              cy.get('a.preview-link').within(function() {
                cy.get('h1').should('have.text', article.title)
                cy.get('p').should('have.text', article.description)
                cy.get('span').should('have.text', 'Read more...')
              })
            })
          })
      })
    })

    it('should sort the feed by most recently created', function () {
      cy.get('div.home-page').find('div.article-preview span.date')
        .should(function($dates) {
          // TODO: Move this into a Chai plugin for better error messages
          const dates = $dates
            .map((i, el) => Cypress.$(el).text())
            .toArray()
          const sorted = dates
            .map(date => Cypress.moment(date, 'ddd MMM DD YYYY'))
            .sort((a, b) => a.isBefore(b))
            .map(moment => moment.format('ddd MMM DD YYYY'))
          expect(dates).to.eql(sorted)
        })
    })

    it('should render a feed toggle with a "Global Feed" tab', function() {
      cy.get('div.home-page').find('div.feed-toggle').within(function() {
        cy.get('ul').within(function() {
          cy.get('li.nav-item')
            .find('a.nav-link.active')
            .should('have.text', 'Global Feed')
        })
      })
    })

    it('should render a tag list in the right column', function() {
      cy.get('.home-page').find('.col-md-3').within(function() {
        cy.get('div.sidebar').within(function() {
          cy.get('p').should('have.text', 'Popular Tags')
          cy.get('div.tag-list').within(function() {
            cy.get('a.tag-pill').each(function($el, i) {
              const tag = this.tags.tags[i]
              cy.wrap($el).should('have.text', tag)
            })
          })
        })
      })
    })

  })

})