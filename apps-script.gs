// Wood & Wine RSVP - Apps Script
// Run setupFormAndConfirmations() once. The sendRSVPEmail trigger fires on every form submit.

function setupFormAndConfirmations() {
  const FORM_ID = '1M0Y0czlPR0O1QjgRjD9AkVoLMpgj-nZ48kJgCFyZAEc';
  const form = FormApp.openById(FORM_ID);

  // 1. Add "Your email" field if it doesn't exist, place it after "Company name"
  let emailItem = null;
  const existing = form.getItems();
  for (let i = 0; i < existing.length; i++) {
    if (existing[i].getTitle().toLowerCase() === 'your email') {
      emailItem = existing[i];
      break;
    }
  }
  if (!emailItem) {
    emailItem = form.addTextItem()
      .setTitle('Your email')
      .setHelpText('So we can send you a confirmation')
      .setRequired(true);
    form.moveItem(emailItem, 3);  // after Q1 (attendance), Q2 (name), Q3 (company)
    Logger.log('Email field added.');
  } else {
    Logger.log('Email field already exists, skipping add.');
  }

  // 2. Link to a Google Sheet (for the tracker)
  let sheetUrl = null;
  const destId = form.getDestinationId();
  if (destId) {
    try {
      const existingSheet = SpreadsheetApp.openById(destId);
      sheetUrl = existingSheet.getUrl();
      Logger.log('Existing linked Sheet: ' + sheetUrl);
    } catch (err) {
      Logger.log('Old destination invalid, will create new.');
    }
  }
  if (!sheetUrl) {
    const newSheet = SpreadsheetApp.create('Wood & Wine RSVP Responses');
    form.setDestination(FormApp.DestinationType.SPREADSHEET, newSheet.getId());
    sheetUrl = newSheet.getUrl();
    Logger.log('New Sheet created: ' + sheetUrl);
  }

  // 3. Ensure the onFormSubmit trigger exists (pointing to sendRSVPEmail)
  const triggers = ScriptApp.getProjectTriggers();
  let hasTrigger = false;
  for (let i = 0; i < triggers.length; i++) {
    if (triggers[i].getHandlerFunction() === 'sendRSVPEmail') {
      hasTrigger = true;
      break;
    }
  }
  if (!hasTrigger) {
    ScriptApp.newTrigger('sendRSVPEmail').forForm(form).onFormSubmit().create();
    Logger.log('Trigger created.');
  }

  Logger.log('');
  Logger.log('================ COPY THESE TWO LINES BACK ================');
  Logger.log('EMAIL_ENTRY_ID: entry.' + emailItem.getId());
  Logger.log('SHEET_URL: ' + sheetUrl);
  Logger.log('===========================================================');
  Logger.log('');
  Logger.log('NEXT: open the Sheet URL above, then');
  Logger.log('  File > Share > Publish to web');
  Logger.log('  Format: Comma-separated values (.csv)');
  Logger.log('  Click Publish, copy the URL, send it to Claude.');
}

function sendRSVPEmail(e) {
  const form = e.source;
  const responses = e.response.getItemResponses();

  let submitterName = '';
  let submitterEmail = '';
  let attendance = '';
  const ordered = [];

  responses.forEach(function(r) {
    const title = r.getItem().getTitle();
    const answer = r.getResponse();
    ordered.push({ title: title, answer: answer });
    if (title === 'Your name') submitterName = String(answer);
    if (title === 'Your email') submitterEmail = String(answer);
    if (title === 'Will you be joining us?') attendance = String(answer);
  });

  const isAttending = attendance.toLowerCase().indexOf('yes') === 0;
  const statusTag = isAttending ? 'attending' : 'declined';

  // 1. Organizer notification (Debbie / Mom = same address)
  let orgBody = 'New RSVP for ' + form.getTitle() + ':\n\n';
  ordered.forEach(function(o) {
    orgBody += o.title + ':\n' + (o.answer || '(none)') + '\n\n';
  });
  MailApp.sendEmail({
    to: 'debbie_petrarca@millerknoll.com',
    subject: 'RSVP: ' + submitterName + ' (' + statusTag + ')',
    body: orgBody
  });

  // 2. Client confirmation
  if (submitterEmail) {
    const firstName = submitterName.split(' ')[0] || 'there';
    let clientBody = 'Hello ' + firstName + ',\n\n';
    if (isAttending) {
      clientBody += 'Thank you for your RSVP to the Wood & Wine Event. We look forward to seeing you on Thursday, June 25.\n\n';
    } else {
      clientBody += 'Thank you for letting us know you cannot make it. We will miss you, and we appreciate the response.\n\n';
    }
    clientBody += 'EVENT DETAILS\n';
    clientBody += '-------------\n';
    clientBody += 'Thursday, June 25\n';
    clientBody += '5:00 PM to 7:30 PM\n';
    clientBody += 'Something Fishy\n';
    clientBody += '175 Metro Center Blvd\n';
    clientBody += 'Warwick, RI 02886\n\n';

    clientBody += 'YOUR RSVP\n';
    clientBody += '---------\n';
    ordered.forEach(function(o) {
      if (o.title !== 'Your email' && o.answer) {
        clientBody += o.title + ': ' + o.answer + '\n';
      }
    });
    clientBody += '\n';

    clientBody += 'Questions? Reply to this email or contact debbie_petrarca@millerknoll.com\n\n';
    clientBody += 'Presented by\n';
    clientBody += 'SHEEHAN\'S OFFICE INTERIORS\n';
    clientBody += 'Geiger and MillerKnoll\n';

    MailApp.sendEmail({
      to: submitterEmail,
      subject: isAttending
        ? 'Your RSVP is confirmed - Wood & Wine Event'
        : 'Thank you for your response - Wood & Wine Event',
      body: clientBody,
      replyTo: 'debbie_petrarca@millerknoll.com',
      name: 'Wood & Wine Event'
    });
  }
}
