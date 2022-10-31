import React from 'react';
import { Route } from 'react-router-dom';

import { user, sales } from 'lib/permissionList';
import requireRole from "components/router/requireRole";
import SwitchWithNotFound from "components/router/SwitchWithNotFound";

import TalktimeWebhookList from './components/talktime/TalktimeWebhookList';
import TalkTimeList from './components/talktime/TalkTimeList';
import TalkTimeCohortSummary from './components/talktime/TalkTimeCohortSummary';
import RawTalktimeList from './components/talktime/RawTalktimeList';
import TalktimeUpload from './components/talktime/TalktimeUpload';
import TalkTimeSummary from './components/talktime/TalkTimeSummary';

const canViewWebTalktime = requireRole(sales.salesWebTalktimeCard);
const canViewIVRTalktime = requireRole(sales.salesIVRTalktimeCard);
const canViewCombinedTalktime = requireRole(sales.salesCombinedTalktimeCard);
const canViewTalktimeSummary = requireRole(sales.salesTalktimeSummaryCard);
const canViewCohortSummary = requireRole(sales.salesCohortSummaryCard);
const canViewWFHAttendance = requireRole(sales.salesWFHAttendanceCard);

const TalktimeRouter = ({ match }) => (
    <SwitchWithNotFound>
    <Route path={`${match.url}/talktime-summary`} exact component={canViewTalktimeSummary(TalkTimeSummary)} />
    <Route path={`${match.url}/talktime-webhook`} exact component={canViewWFHAttendance(TalktimeWebhookList)} />
    <Route path={`${match.url}/talktime-upload`} exact component={canViewCohortSummary(TalktimeUpload)} />
    <Route path={`${match.url}/talktime/web`} exact component={canViewWebTalktime(() => <TalkTimeList source={["ameyo_web"]} />)} />
    <Route path={`${match.url}/talktime/ivr`} exact component={canViewIVRTalktime(() => <TalkTimeList source={['ameyo_ivr']} />)} />
    <Route path={`${match.url}/talktime/combined`} exact component={canViewCombinedTalktime(() => <TalkTimeList source={["ameyo_web", "ameyo_ivr"]} />)} />
    <Route path={`${match.url}/raw-talktime`} exact component={canViewCohortSummary(RawTalktimeList)} />
    <Route path={`${match.url}/cohort-summary`} exact component={canViewCohortSummary(TalkTimeCohortSummary)} />
    </SwitchWithNotFound>
);
export default TalktimeRouter;