// Deployment reference for SyncSalesReporting's saved trigger condition.
// This models the condition; it is not proof of live connector execution.
export const triggerCondition = "@and(not(empty(triggerBody()?['ClientRequestId'])),not(empty(triggerBody()?['ExcelRowKey'])),not(startsWith(toLower(coalesce(triggerBody()?['ClientRequestId'],'')),'performance-test-')),not(startsWith(toUpper(coalesce(triggerBody()?['ProjectName'],'')),'TEST ONLY')),not(contains(toUpper(coalesce(triggerBody()?['Title'],'')),'TEST ONLY')))";

export function eligibleForLiveReport(row) {
  return Boolean(row.ClientRequestId && row.ExcelRowKey) &&
    !String(row.ClientRequestId).toLowerCase().startsWith('performance-test-') &&
    !String(row.ProjectName ?? '').toUpperCase().startsWith('TEST ONLY') &&
    !String(row.Title ?? '').toUpperCase().includes('TEST ONLY');
}

// Enqueue/worker scope additionally excludes known fixtures by stable identities.
// Title exclusions alone are insufficient if a tester later renames a fixture.
export const knownFixtureIds = Object.freeze([154, 155, 156, 157, 158, 159, 160, 163]);
export const productionQueueCondition = "@and(not(empty(triggerBody()?['ClientRequestId'])),not(empty(triggerBody()?['ExcelRowKey'])),greaterOrEquals(int(coalesce(triggerBody()?['Revision'],0)),1),not(contains(createArray(154,155,156,157,158,159,160,163),int(triggerBody()?['ID']))),not(startsWith(toLower(coalesce(triggerBody()?['ClientRequestId'],'')),'performance-test-')),not(startsWith(toLower(coalesce(triggerBody()?['ExcelRowKey'],'')),'app-performance-test-')),not(startsWith(toUpper(coalesce(triggerBody()?['ProjectName'],'')),'TEST ONLY')),not(contains(toUpper(coalesce(triggerBody()?['Title'],'')),'TEST ONLY')))";

export function eligibleForProductionQueue(row) {
  if (!Number.isSafeInteger(row.ID) || row.ID < 1 ||
      !Number.isSafeInteger(row.Revision) || row.Revision < 1) return false;
  return eligibleForLiveReport(row) && !knownFixtureIds.includes(row.ID) &&
    !String(row.ExcelRowKey).toLowerCase().startsWith('app-performance-test-');
}
