import { productionQueueCondition, eligibleForProductionQueue, knownFixtureIds }
  from './production-reporting-trigger.mjs';
import { jobKey } from './reporting-recovery-policy.mjs';

const source = "body('Get_item')";
const job = "body('Send_an_HTTP_request_to_SharePoint')?['d']";
const eligible = productionQueueCondition.slice(1).replaceAll('triggerBody()', source);
export const productionWorkerGuard = `and(${eligible},not(empty(${source}?['QuoteNo'])),` +
  `equals(int(${source}?['ID']),int(${job}?['OpportunityId'])),` +
  `greaterOrEquals(int(${source}?['Revision']),int(${job}?['TargetRevision'])),` +
  `equals(${job}?['Title'],concat(string(${source}?['ID']),'-',string(${job}?['TargetRevision']))))`;

export const productionClaimGuard = `and(greater(int(coalesce(${job}?['OpportunityId'],0)),0),` +
  `not(contains(createArray(${knownFixtureIds.join(',')}),int(${job}?['OpportunityId']))),` +
  `greater(int(coalesce(${job}?['TargetRevision'],0)),0),` +
  `equals(${job}?['Title'],concat(string(${job}?['OpportunityId']),'-',string(${job}?['TargetRevision']))),` +
  `less(int(${job}?['AttemptCount']),8),` +
  `or(equals(${job}?['State'],'Pending'),equals(${job}?['State'],'Retry')),` +
  `lessOrEquals(ticks(coalesce(${job}?['NextAttemptAt'],'1900-01-01T00:00:00Z')),ticks(utcNow())))`;

export const productionReaderFilter = knownFixtureIds.map(id => `OpportunityId ne ${id}`).join(' and ') +
  " and AttemptCount lt 8 and (State eq 'Pending' or State eq 'Retry')" +
  " and (NextAttemptAt eq null or NextAttemptAt le '@{utcNow()}')";

export function productionJobCanBeClaimed(row, now) {
  if (!Number.isSafeInteger(row?.OpportunityId) || row.OpportunityId < 1 ||
      knownFixtureIds.includes(row.OpportunityId) ||
      !Number.isSafeInteger(row.TargetRevision) || row.TargetRevision < 1 ||
      row.Title !== jobKey(row.OpportunityId, row.TargetRevision) ||
      !Number.isSafeInteger(row.AttemptCount) || row.AttemptCount < 0 || row.AttemptCount >= 8 ||
      !['Pending', 'Retry'].includes(row.State)) return false;
  const due = row.NextAttemptAt == null ? Date.parse('1900-01-01T00:00:00Z') : Date.parse(row.NextAttemptAt);
  return Number.isFinite(due) && Number.isFinite(Date.parse(now)) && due <= Date.parse(now);
}

export function productionSourceMatchesJob(sourceRecord, queueRecord) {
  if (!eligibleForProductionQueue(sourceRecord) || !sourceRecord.QuoteNo) return false;
  if (!Number.isSafeInteger(queueRecord?.TargetRevision) || queueRecord.TargetRevision < 1)
    return false;
  return sourceRecord.ID === queueRecord.OpportunityId &&
    sourceRecord.Revision >= queueRecord.TargetRevision &&
    queueRecord.Title === jobKey(sourceRecord.ID, queueRecord.TargetRevision);
}
