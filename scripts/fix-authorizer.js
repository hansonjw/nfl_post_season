// Script to remove identity_source from Cognito authorizer
// This fixes the "IncompleteSignatureException" error

import { APIGatewayClient, UpdateAuthorizerCommand, GetAuthorizerCommand } from '@aws-sdk/client-api-gateway';

const client = new APIGatewayClient({ region: 'us-west-2' });
const restApiId = '7fafxcafc1';
const authorizerId = '80dhow';

async function fixAuthorizer() {
  try {
    // First, get the current authorizer to see its config
    const getCmd = new GetAuthorizerCommand({
      restApiId,
      authorizerId,
    });
    const current = await client.send(getCmd);
    console.log('Current authorizer:', {
      type: current.type,
      identitySource: current.identitySource,
      name: current.name,
    });

    // Update the authorizer - try replacing identity_source with empty string
    // For COGNITO_USER_POOLS, we might need to set it to empty or use default
    const updateCmd = new UpdateAuthorizerCommand({
      restApiId,
      authorizerId,
      patchOperations: [
        {
          op: 'replace',
          path: '/identitySource',
          value: '', // Try empty string
        },
      ],
    });

    const result = await client.send(updateCmd);
    console.log('✅ Authorizer updated successfully!');
    console.log('Updated authorizer:', {
      type: result.type,
      identitySource: result.identitySource,
      name: result.name,
    });

    console.log('\n⚠️  You may need to wait 10-15 seconds for the change to propagate.');
    console.log('Then try editing a player again in your browser.');
  } catch (error) {
    console.error('❌ Error updating authorizer:', error);
    process.exit(1);
  }
}

fixAuthorizer();
