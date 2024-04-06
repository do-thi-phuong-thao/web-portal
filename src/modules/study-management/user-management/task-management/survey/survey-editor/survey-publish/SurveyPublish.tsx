import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useInterval, useToggle } from 'react-use';

import { DateTime } from 'luxon';
import styled, { css } from 'styled-components';
import { Timestamp } from 'src/common/utils/datetime';
import { useSelectedStudyId } from 'src/modules/studies/studies.slice';
import { colors, px, typography } from 'src/styles';


import { useParticipantsTimeZones } from 'src/modules/study-management/user-management/common/participantTimezones.slice';
import { getMaxTimezone } from 'src/modules/study-management/user-management/common/utils';
import { DurationPeriod, ScheduleFrequency } from '../../../publish-task/publishTask.slice';
import { DEFAULT_VALID_DURATION_VALUE } from '../../../publish-task/constants';
import TimeNoLongerValid from '../../../publish-task/TimeNoLongerValid';
import Schedule from '../../../publish-task/Schedule';
import Occurrence from '../../../publish-task/Occurrence';
import TimeWarning from '../../../publish-task/TimeWarning';
import SurveySeries from './SurveySeries';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-top: ${px(10)};
  background-color: ${colors.primaryWhite};
  border-radius: ${px(4)};
  width: 100%;
`;

const TIME_WARNING_THRESHOLD = 5 * 60;

const SurveyPublish = ({ }) => {
  const studyId = useSelectedStudyId();
  const type = 'survey';
  const participantsTimeZones = useParticipantsTimeZones({
    fetchArgs: !!studyId && { studyId },
  });

  const [frequency, setFrequency] = useState<ScheduleFrequency>(ScheduleFrequency.ONE_TIME);
  const [startDateTime, setStartDateTime] = useState<Timestamp>(0);
  const [endDate, setEndDate] = useState<Timestamp>(0);
  const [noExpiration, setNpExpiration] = useToggle(false);
  const [lateResponse, toggleLateResponse] = useToggle(false);
  const [durationPeriodValue, setDurationPeriodValue] = useState(DEFAULT_VALID_DURATION_VALUE);
  const [durationPeriodType, setDurationPeriodType] = useState<DurationPeriod>(DurationPeriod.DAY);
  const [timeWarningHiddenByUser, setTimeWarningHiddenByUser] = useState(false);
  const [secondsToStart, setSecondsToStart] = useState(0);

  const [minAllowedDateTime, setMinAllowedDateTime] = useState(0);

  const getMinAllowedDateTime = useCallback(() => {
    const maxTz = getMaxTimezone(participantsTimeZones.data);
    const currentTime = DateTime.local({ zone: maxTz.iana });
    let extraMinutes = 30;

    if (currentTime.minute > 30) {
      extraMinutes += 60 - currentTime.minute;
    } else {
      extraMinutes += 30 - currentTime.minute;
    }

    const date = DateTime.fromObject({
      ...currentTime.plus({ minute: extraMinutes }).toObject(),
      second: 0,
      millisecond: 0,
    }).toMillis();

    return date;
  }, [participantsTimeZones.data]);

  const updateMinAllowedDateTime = useCallback(() => {
    const newDate = getMinAllowedDateTime();

    setMinAllowedDateTime(newDate);
  }, [getMinAllowedDateTime]);

  const getSecondsToStart = useCallback(() => {
    const maxTz = getMaxTimezone(participantsTimeZones.data);
    const currentTime = DateTime.local({ zone: maxTz.iana });
    const currentTimeMs = DateTime.fromObject({
      ...currentTime.toObject(),
      millisecond: 0,
    }).toMillis();

    return (startDateTime - currentTimeMs) / 1000;
  }, [participantsTimeZones.data, startDateTime]);

  useEffect(() => {
    updateMinAllowedDateTime();
  }, [participantsTimeZones.data, updateMinAllowedDateTime]);

  useInterval(
    () => {
      setSecondsToStart(getSecondsToStart());
    },
    !open || !startDateTime ? null : 1000
  );

  const handleStartDateChange = useCallback(
    (date: Timestamp) => {
      const timeDt = DateTime.fromMillis(startDateTime);
      const newStartDateTime = DateTime.fromMillis(date)
        .startOf('day')
        .set({
          hour: timeDt.hour,
          minute: timeDt.minute,
        })
        .toMillis();

      updateMinAllowedDateTime();

      setStartDateTime(Math.max(newStartDateTime, minAllowedDateTime));
      setTimeWarningHiddenByUser(false);
    },
    [startDateTime, updateMinAllowedDateTime, minAllowedDateTime]
  );

  const handlePublishTimeChange = useCallback(
    (minute: number) => {
      setStartDateTime(
        DateTime.fromMillis(startDateTime).startOf('day').plus({ minute }).toMillis()
      );
      setTimeWarningHiddenByUser(false);
    },
    [startDateTime]
  );

  const updateExpiredStartDateTime = useCallback(() => {
    const newDate = getMinAllowedDateTime();
    setStartDateTime(newDate);
    setMinAllowedDateTime(newDate);
    setTimeWarningHiddenByUser(false);
  }, [getMinAllowedDateTime]);

  const handleFrequencyChange = useCallback(
    (key: ScheduleFrequency) => {
      if (key !== ScheduleFrequency.ONE_TIME) {
        const endTime = DateTime.fromMillis(startDateTime).plus({ month: 3 }).toMillis();
        setEndDate(endTime);
      }

      setFrequency(key);
    },
    [startDateTime]
  );

  const isTimeWarningHidden = useMemo(
    () => timeWarningHiddenByUser || secondsToStart < 0 || secondsToStart > TIME_WARNING_THRESHOLD,
    [secondsToStart, timeWarningHiddenByUser]
  );

  return (
    <Container data-testid="publish-survey">
      <TimeNoLongerValid open={secondsToStart < 0} onClose={updateExpiredStartDateTime} />
        <Schedule frequency={frequency} onFrequencyChange={handleFrequencyChange} />
        {frequency !== ScheduleFrequency.ONE_TIME && (
          <SurveySeries
            noExpiration={noExpiration}
            startDate={startDateTime}
            endDate={endDate}
            minAllowedDate={minAllowedDateTime}
            onStartDateChange={handleStartDateChange}
            onEndDateChange={setEndDate}
            onChangeExpiration={setNpExpiration}
          />
        )}
        <Occurrence
          type={type}
          frequency={frequency}
          startDate={startDateTime}
          endDate={endDate}
          noExpiration={noExpiration}
          minAllowedDate={minAllowedDateTime}
          durationPeriodValue={durationPeriodValue}
          durationPeriodType={durationPeriodType}
          onStartDateChange={handleStartDateChange}
          onPublishTimeChange={handlePublishTimeChange}
          onDurationPeriodValueChange={setDurationPeriodValue}
          onDurationPeriodTypeChange={setDurationPeriodType}
          lateResponse={lateResponse}
          onLateResponseChange={toggleLateResponse}
          onPublishTimeClick={updateMinAllowedDateTime}
        />
        <TimeWarning
          seconds={isTimeWarningHidden ? 0 : secondsToStart}
          onClose={() => setTimeWarningHiddenByUser(true)}
        />
    </Container>
  );
};

export default SurveyPublish;
