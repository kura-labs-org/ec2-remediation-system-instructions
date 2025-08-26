var EC2RemediationHelper = Class.create();
EC2RemediationHelper.prototype = Object.extendsObject(
  global.AbstractAjaxProcessor,
  {
    triggerRemediation: function () {
      var ec2SysId = this.getParameter('sysparm_ec2_sys_id');

      try {
        gs.info('EC2RemediationHelper: ec2SysId=' + ec2SysId);

        if (!ec2SysId) {
          return JSON.stringify({
            success: false,
            message: 'Missing required parameter: sysparm_ec2_sys_id',
          });
        }

        // Look up the EC2 instance record
        var ec2Gr = new GlideRecord('x_snc_ec2_monito_0_ec2_instance');
        if (!ec2Gr.get(ec2SysId)) {
          return JSON.stringify({
            success: false,
            message: 'EC2 Instance record not found',
          });
        }

        var instanceId = ec2Gr.getValue('instance_id');
        gs.info('EC2RemediationHelper: Found instanceId=' + instanceId);

        // Get credentials from connection store
        var aliasGr = new GlideRecord('sys_alias');
        aliasGr.addQuery('name', 'AWS Integration Server C C Alias');
        aliasGr.query();
        aliasGr.next();
        var aliasSysId = aliasGr.getUniqueValue();

        var connectionInfo =
          new sn_cc.ConnectionInfoProvider().getConnectionInfoByDomain(
            aliasSysId,
            'global'
          );
        var username = connectionInfo.getCredentialAttribute('user_name');
        var password = connectionInfo.getCredentialAttribute('password');
        var connectionUrl = connectionInfo.getAttribute('connection_url');

        // Make API call
        var request = new sn_ws.RESTMessageV2();
        request.setEndpoint(connectionUrl);
        request.setHttpMethod('POST');
        request.setBasicAuth(username, password);
        request.setRequestHeader('Content-Type', 'application/json');
        request.setRequestHeader('Accept', 'application/json');

        var requestBody = JSON.stringify({instance_id: instanceId});
        request.setRequestBody(requestBody);

        var startTime = new Date().getTime();
        var response = request.execute();
        var endTime = new Date().getTime();
        var responseTime = endTime - startTime;

        var httpStatusCode = response.getStatusCode();
        var responseBody = response.getBody();
        var errorMessage = response.getErrorMessage();
        var isSuccess = httpStatusCode >= 200 && httpStatusCode < 300;

        gs.info(
          'EC2RemediationHelper: API Response - Status: ' +
            httpStatusCode +
            ', Body: ' +
            responseBody
        );

        // error message with details
        var fullErrorMessage = null;
        if (!isSuccess) {
          fullErrorMessage = 'API call failed - HTTP ' + httpStatusCode;
          if (errorMessage) {
            fullErrorMessage += '\nError: ' + errorMessage;
          }
          if (responseBody) {
            fullErrorMessage += '\nResponse: ' + responseBody;
          }
        }

        // Create remediation log entry
        var logGr = new GlideRecord('x_snc_ec2_monito_0_remediation_log');
        logGr.initialize();
        logGr.setValue('ec2_instance', ec2SysId);
        logGr.setValue('attempted_status', 'On');
        logGr.setValue('timestamp', new GlideDateTime());
        logGr.setValue('request_payload', requestBody);
        logGr.setValue('success', isSuccess);
        logGr.setValue('response_payload', responseBody);
        logGr.setValue('http_status_code', httpStatusCode);
        logGr.setValue('response_time_ms', responseTime);

        if (fullErrorMessage) {
          logGr.setValue('error_message', fullErrorMessage);
        }

        var logId = logGr.insert();
        gs.info('Created log entry: ' + logId);

        return JSON.stringify({
          success: isSuccess,
          message: isSuccess
            ? 'Instance start request sent successfully!'
            : fullErrorMessage,
          log_id: logId,
          instance_id: instanceId,
          http_status: httpStatusCode,
          response_time_ms: responseTime,
        });
      } catch (e) {
        var errorMsg = 'Exception in triggerRemediation: ' + e.message;
        var stackTrace = e.stack || 'Stack trace not available';

        gs.error('EC2RemediationHelper error: ' + errorMsg);
        gs.error('Stack trace: ' + stackTrace);

        // Log error with full stack trace
        var errorLogGr = new GlideRecord('x_snc_ec2_monito_0_remediation_log');
        errorLogGr.initialize();
        errorLogGr.setValue('ec2_instance', ec2SysId || 'unknown');
        errorLogGr.setValue('attempted_status', 'On');
        errorLogGr.setValue('timestamp', new GlideDateTime());
        errorLogGr.setValue('success', false);
        errorLogGr.setValue(
          'response_payload',
          'Exception: ' + errorMsg + '\n\nStack Trace:\n' + stackTrace
        );
        errorLogGr.setValue(
          'error_message',
          errorMsg + '\n\nStack Trace:\n' + stackTrace
        );
        errorLogGr.setValue('http_status_code', 0);
        errorLogGr.setValue('response_time_ms', 0);
        errorLogGr.insert();

        return JSON.stringify({
          success: false,
          message: errorMsg,
          stack_trace: stackTrace,
        });
      }
    },

    type: 'EC2RemediationHelper',
  }
);
