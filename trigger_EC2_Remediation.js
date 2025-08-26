function trigger_EC2_Remediation() {
  var recordSysId = g_form.getUniqueValue();

  if (!recordSysId) {
    alert('Unable to get record ID');
    return;
  }

  var ga = new GlideAjax('x_snc_ec2_monito_0.EC2RemediationHelper');
  ga.addParam('sysparm_name', 'triggerRemediation');
  ga.addParam('sysparm_ec2_sys_id', recordSysId);

  ga.getXMLAnswer(function (answer) {
    if (!answer) {
      alert('No response from server. Check the Remediation Log for details.');
      return;
    }

    if (answer.indexOf('"success":true') !== -1) {
      alert('Remediation request submitted successfully!');
    } else {
      alert(
        'Remediation request failed. Check the Remediation Log for error details.'
      );
    }

    g_form.reload();
  });
}
