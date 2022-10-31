import React from 'react';

import TabBuilder from 'modules/core/components/TabBuilder';
import { Box, BoxHeader, BoxBody } from 'components/box';

import TalkTimeList from './TalkTimeList';
import TalkTimeSummary from './TalkTimeSummary';
import TalkTimeCohortSummary from './TalkTimeCohortSummary'

const WfhTalkTime = (props) => {
  const tabs = [ {
    icon: "bjs-wfh-web-talktime",
    title: "WFH Web TalkTime",
    component: <TalkTimeList source={["ameyo_web"]}/>
  }, {
    icon: "bjs-web-ivr-talktime",
    title: "WFH IVR TalkTime",
    component: <TalkTimeList source={["ameyo_ivr"]}/>
  }, {
    icon: "bjs-department",
    title: "WFH Combined TalkTime",
    component: <TalkTimeList source={["ameyo_web","ameyo_ivr"]}/>
  }, {
    icon: "bjs-wfh-talktime-summary",
    title: "WFH TalkTime Summary",
    component: <TalkTimeSummary />
  }, {
    icon: "bjs-wfh-talktime-cohort-summary",
    title: "WFH TalkTime Cohort Summary",
    component: <TalkTimeCohortSummary />
  }];

  return (
    <Box>
      <BoxHeader heading="WFH TalkTime Dashboard" />
      <BoxBody>
        <TabBuilder tabs={tabs} />
      </BoxBody>
    </Box>
  )
}

export default WfhTalkTime;
