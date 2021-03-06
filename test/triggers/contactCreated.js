const should = require('should');

const zapier = require('zapier-platform-core');

const App = require('../../index');
const appTester = zapier.createAppTester(App);

describe('contact triggers', () => {

  describe('new contact created trigger', () => {

    var subscribeData = null;

    it('should create a contact create hook', (done) => {
      zapier.tools.env.inject();
      const bundle = {
        targetUrl: 'http://provided.by?zapier',
        authData: {
          baseUrl: process.env.TEST_BASE_URL,
          username: process.env.TEST_BASIC_AUTH_USERNAME,
          password: process.env.TEST_BASIC_AUTH_PASSWORD
        }
      };

      appTester(App.triggers.contactCreated.operation.performSubscribe, bundle)
        .then(response => {
          should.exist(response.hook);
          response.hook.webhookUrl.should.eql(bundle.targetUrl);
          response.hook.id.should.be.greaterThan(0);
          response.hook.name.should.eql('Trigger Zapier about contact create events');
          response.hook.description.should.eql('Created via Zapier');
          response.hook.triggers.should.eql(['mautic.lead_post_save_new']);

          // Set subscribeDate for the unsubscribe test
          subscribeData = response;

          done();
        })
        .catch(done);

    });

    it('should delete a contact create hook', (done) => {
      zapier.tools.env.inject();
      const bundle = {
        targetUrl: 'http://provided.by?zapier',
        subscribeData: subscribeData,
        authData: {
          baseUrl: process.env.TEST_BASE_URL,
          username: process.env.TEST_BASIC_AUTH_USERNAME,
          password: process.env.TEST_BASIC_AUTH_PASSWORD
        }
      };

      // Delete the created hook to clean up after previous test and to test delete too
      appTester(App.triggers.contactCreated.operation.performUnsubscribe, bundle)
        .then(response => {
          should.exist(response.hook);
          response.hook.webhookUrl.should.eql(bundle.targetUrl);
          response.hook.name.should.eql('Trigger Zapier about contact create events');
          response.hook.description.should.eql('Created via Zapier');
          response.hook.triggers.should.eql(['mautic.lead_post_save_new']);

          done();
        })
        .catch(done);

    });

    it('should load contact from fake hook', (done) => {
      zapier.tools.env.inject();
      const bundle = {
        cleanedRequest: App.triggers.contactCreated.operation.sample
      };

      appTester(App.triggers.contactCreated.operation.perform, bundle)
        .then(contacts => {
          contacts.should.eql(
            [
              {
                id: 14,
                dateAdded: '2017-06-13T09:15:47+00:00',
                dateIdentified: '2017-06-13T09:15:47+00:00',
                createdBy: 1,
                createdByUser: 'John Doe',
                points: 0,
                title: 'Mr.',
                firstname: 'John',
                lastname: 'Doe',
                company: null,
                position: 'Q&#38;A',
                email: 'john@doe.com',
                mobile: '666555444',
                phone: null,
                fax: null,
                address1: 'Under the hill',
                address2: null,
                city: 'Prague',
                state: null,
                zipcode: '1600',
                country: 'Czech Republic',
                preferred_locale: 'cs_CZ',
                attribution_date: '',
                attribution: null,
                website: 'http://doe.com',
                facebook: 'johndoe',
                foursquare: null,
                googleplus: null,
                instagram: null,
                linkedin: null,
                skype: null,
                twitter: 'johndoe',
                ownedBy: 1,
                ownedByUsername: 'admin',
                ownedByUser: 'John Doe',
                tags: ''
              }
            ]
          );

          done();
        })
        .catch(done);
    });
  });
});
