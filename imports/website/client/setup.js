import './setup.html';
import './setup.css';

import SimpleSchema from 'simpl-schema';

Template.Setup.onRendered(function() {

});

Template.Setup.events({
  "click .setup-panel a"(e, t) {
    e.preventDefault();

    let item = $(e.target);
    let target = $(item.attr('href'));

    if (!item.attr('disabled')) {
      $('.setup-panel a').removeClass('btn-primary').addClass('btn-default');
      item.addClass('btn-primary');
      $('.setup-content').addClass('hide');
      target.removeClass('hide');
      target.find('input:eq(0)').focus();
    }
  },
  "click .btn-prev"(e, t) {
    e.preventDefault();

    let curStep = $(e.target).closest(".setup-content");
    let curStepBtn = curStep.attr("id");
    let prevStepWizard = $('.setup-panel a[href="#' + curStepBtn + '"]').parent().prev().children("a");

    prevStepWizard.removeAttr('disabled').trigger('click');
  },
  "click .btn-next"(e, t) {
    e.preventDefault();

    let curStep = $(e.target).closest(".setup-content");
    let curStepBtn = curStep.attr("id");
    let nextStepWizard = $('.setup-panel a[href="#' + curStepBtn + '"]').parent().next().children("a");
    let curInputs = curStep.find("input[type='text'],input[type='url']");
    let isValid = true;

    $(".form-group").removeClass("has-error");
    for(var i=0; i<curInputs.length; i++){
      if (!curInputs[i].validity.valid){
        isValid = false;
        $(curInputs[i]).closest(".form-group").addClass("has-error");
      }
    }

    if (isValid) {
      switch($(e.target).data("panel")) {
      case "company":
        Meteor.call("setupCompany", $('input[name=company]').val(), $('input[name=domain]').val(), (err, res) => {
          nextStepWizard.removeAttr('disabled').trigger('click');
        });
        break;
      case "email":
        Meteor.call("setupEmail", $('select[name=emailType]').val(), {key: $('input[name=mailgun]').val()}, (err, res) => {
          nextStepWizard.removeAttr('disabled').trigger('click');
        });
        break;
      case "s3":
        Meteor.call("setupS3", $('select[name=storageType]').val(), {
          key: $('input[name=s3Key]').val(),
          secret: $('input[name=s3Secret]').val(),
          bucket: $('input[name=s3Bucket]').val(),
          region: $('input[name=s3Region]').val(),
        }, (err, res) => {
          nextStepWizard.removeAttr('disabled').trigger('click');
        });
        break;
      }
    }
  },
  "change select[name=emailType]"(e, t) {
    e.preventDefault();

    if($(e.target).val() === 'mailgun') {
      $('#mailgun-key').removeClass('hide');
    } else {
      $('#mailgun-key').addClass('hide');
    }
  },
  "change select[name=storageType]"(e, t) {
    e.preventDefault();

    if($(e.target).val() === 's3') {
      $('#s3-config').removeClass('hide');
    } else {
      $('#s3-config').addClass('hide');
    }
  }
});

Template.Setup.helpers({
  formCollection() {
    return Instance;
  },
  formSchema() {
    return new SimpleSchema({
      company: {
        type: String,
        max: 50,
        autoform: {
          type: 'text',
          label: I18n.t('Company')
        }
      },
      domain: {
        type: String,
        max: 50,
        autoform: {
          type: 'text',
          label: I18n.t('Domain')
        }
      },
      emailType: {
        type: String,
        autoform: {
          type: 'select',
          label: false,
          firstOption: false, // I18n.t("Email Disabled")
          options: [{
            label: "Mailgun",
            value: 'mailgun'
          }]
        }
      },
      mailgun: {
        type: String,
        max: 30,
        autoform: {
          type: 'text',
          label: 'Mailgun Key'
        }
      },
      storageType: {
        type: String,
        optional: true,
        autoform: {
          type: 'select',
          label: false,
          firstOption: I18n.t("Local Storage"),
          options: [{
            label: "Amazon S3",
            value: 's3'
          }]
        }
      },
      s3Key: {
        type: String,
        max: 20,
        optional: true,
        autoform: {
          type: 'text',
          label: I18n.t('S3 Key'),
        }
      },
      s3Secret: {
        type: String,
        max: 40,
        optional: true,
        autoform: {
          type: 'text',
          label: I18n.t('S3 Secret'),
        }
      },
      s3Bucket: {
        type: String,
        max: 50,
        optional: true,
        autoform: {
          type: 'text',
          label: I18n.t('S3 Bucket'),
        }
      },
      s3Region: {
        type: String,
        max: 30,
        optional: true,
        autoform: {
          type: 'text',
          label: I18n.t('S3 Region'),
        }
      },
      name: {
        type: String,
        max: 50,
        autoform: {
          type: 'text',
          label: I18n.t('User Name'),
        }
      },
      email: {
        type: String,
        max: 50,
        regEx: SimpleSchema.RegEx.Email,
        autoform: {
          type: 'emailInput',
          label: 'Email'
        }
      },
      password: {
        type: String,
        max: 50,
        autoform: {
          type: 'password',
          label: I18n.t("Password")
        }
      }
    });
  }
});

AutoForm.hooks({
  "setup-form": {
    onSubmit: function(insertDoc, updateDoc, currentDoc) {
      this.event.preventDefault();

      Meteor.call('setupAdmin', insertDoc.name, insertDoc.email, insertDoc.password, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log(res);
          Router.go('/login');
        }
        this.done();
      });
    }
  }
});
