/* eslint-disable no-nested-ternary */
import React, { useEffect, useState } from 'react';
import './TimelineComponent.css';
import { Timeline, TimelineEvent } from '@mailtop/horizontal-timeline';

const TimelineComponent = ({ reportData, suggestedFeatures, onReleaseClick }) => {
  const [releaseData, setReleaseData] = useState([]);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    setReleaseData(reportData);
  }, [reportData]);

  useEffect(() => {
    setFeatures(suggestedFeatures);
  }, [suggestedFeatures]);

  return (
    <Timeline height={360} placeholder>
      {(
        releaseData && releaseData.map((releaseItem, idx) => (
          <TimelineEvent
            key={idx}
            color={releaseItem.bgColor}
            icon={releaseItem.icon}
            title={
              <span 
                style={{ cursor: onReleaseClick ? 'pointer' : 'default', color: '#0C5595' }}
                onClick={() => onReleaseClick && onReleaseClick(releaseItem)}
              >
                {releaseItem.name}
              </span>
            }
            subtitle={releaseItem.release_date}
            action={(
              <div
                className="feature-list m-2"
                style={{
                  backgroundColor: releaseItem.bgColor,
                  padding: 8,
                  paddingLeft: 20,
                  color: releaseItem.bgColor === '#0C5594'
                    || releaseItem.bgColor === '#152944'
                    ? '#fff'
                    : '#000',
                }}
              >
                <ul className="p-2">
                  {releaseItem && releaseItem.features
                    ? (
                      releaseItem.features.map(
                        (feature, index) => (
                          <li key={`feat-${index}`}>{feature.name}</li>
                        ),
                      )
                    ) : features
                      ? (
                        features.map(
                          (feature, index) => (
                            <li key={`feat-${index}`}>{`${feature?.suggested_feature}(Sug.)`}</li>
                          ),
                        )
                      ) : null}
                </ul>
              </div>
            )}
          />
        ))
      )}
    </Timeline>
  );
};

export default TimelineComponent;
