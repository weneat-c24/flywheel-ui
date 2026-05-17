import type { SessionSummary } from '@/api/types'

export const sessionPool: SessionSummary[] = [
  { id:'c1',  agent:'a1', type:'voice', time:'Today 14:22',       dur:'2:48', caller:'+1 (415) ••• 0921', outcome:'booked',      passed:'3/5', maxSev:'crit', failedKpis:['k2'],       fp:1, frustration:true,  version:'v3' },
  { id:'c2',  agent:'a1', type:'voice', time:'Today 13:51',       dur:'1:34', caller:'+1 (628) ••• 4471', outcome:'voicemail',   passed:'—',   maxSev:'info', failedKpis:[],           fp:0,                   version:'v3' },
  { id:'c3',  agent:'a1', type:'voice', time:'Today 13:12',       dur:'3:09', caller:'+1 (510) ••• 2206', outcome:'booked',      passed:'5/5', maxSev:'ok',   failedKpis:[],           fp:0,                   version:'v3' },
  { id:'c4',  agent:'a1', type:'voice', time:'Today 12:47',       dur:'2:21', caller:'+1 (650) ••• 7733', outcome:'booked',      passed:'3/5', maxSev:'crit', failedKpis:['k2','k1'],  fp:1, frustration:true,  version:'v3' },
  { id:'c5',  agent:'a1', type:'voice', time:'Today 12:33',       dur:'4:51', caller:'+1 (415) ••• 1108', outcome:'transferred', passed:'4/5', maxSev:'warn', failedKpis:['k5'],       fp:0,                   version:'v3' },
  { id:'c6',  agent:'a1', type:'voice', time:'Today 11:58',       dur:'2:02', caller:'+1 (707) ••• 8841', outcome:'hangup',      passed:'2/5', maxSev:'crit', failedKpis:['k1','k4'],  fp:0, frustration:true,  version:'v3' },
  { id:'c7',  agent:'a1', type:'voice', time:'Today 11:22',       dur:'2:38', caller:'+1 (628) ••• 5512', outcome:'booked',      passed:'3/5', maxSev:'crit', failedKpis:['k2'],       fp:1,                   version:'v3' },
  { id:'c8',  agent:'a1', type:'voice', time:'Today 10:44',       dur:'3:14', caller:'+1 (415) ••• 0049', outcome:'booked',      passed:'5/5', maxSev:'ok',   failedKpis:[],           fp:0,                   version:'v3' },
  { id:'c9',  agent:'a1', type:'voice', time:'Today 09:51',       dur:'1:18', caller:'+1 (510) ••• 3380', outcome:'hangup',      passed:'1/5', maxSev:'crit', failedKpis:['k4','k1'],  fp:0,                   version:'v3' },
  { id:'c10', agent:'a1', type:'voice', time:'Today 09:08',       dur:'2:55', caller:'+1 (650) ••• 6612', outcome:'booked',      passed:'4/5', maxSev:'warn', failedKpis:['k2'],       fp:0,                   version:'v3' },
  { id:'c11', agent:'a1', type:'voice', time:'Yesterday 23:41',   dur:'2:09', caller:'+1 (707) ••• 1290', outcome:'booked',      passed:'3/5', maxSev:'crit', failedKpis:['k2'],       fp:0, frustration:true,  version:'v3' },
  { id:'c12', agent:'a1', type:'voice', time:'Yesterday 22:55',   dur:'3:43', caller:'+1 (415) ••• 4421', outcome:'transferred', passed:'2/5', maxSev:'crit', failedKpis:['k4'],       fp:1,                   version:'v3' },
  { id:'c13', agent:'a1', type:'voice', time:'Yesterday 21:30',   dur:'2:18', caller:'+1 (628) ••• 9907', outcome:'booked',      passed:'5/5', maxSev:'ok',   failedKpis:[],           fp:0,                   version:'v3' },
  { id:'c14', agent:'a1', type:'voice', time:'Yesterday 20:12',   dur:'1:54', caller:'+1 (510) ••• 0712', outcome:'hangup',      passed:'3/5', maxSev:'warn', failedKpis:['k1'],       fp:0,                   version:'v3' },
  { id:'c15', agent:'a1', type:'voice', time:'Yesterday 19:48',   dur:'2:32', caller:'+1 (650) ••• 5519', outcome:'booked',      passed:'3/5', maxSev:'crit', failedKpis:['k2'],       fp:0,                   version:'v3' },
]
