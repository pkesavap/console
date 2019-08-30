import * as React from 'react';
import * as _ from 'lodash';
import {
  Chart,
  ChartAxis,
  ChartBar,
  ChartGroup,
  ChartLegend,
  ChartThemeColor,
} from '@patternfly/react-charts';
import {
  DashboardCard,
  DashboardCardBody,
  DashboardCardHeader,
  DashboardCardTitle,
} from '@console/internal/components/dashboard/dashboard-card';
import {
  DashboardItemProps,
  withDashboardResources,
} from '@console/internal/components/dashboards-page/with-dashboard-resources';
import { humanizeBinaryBytes, humanizeNumber } from '@console/internal/components/utils';
import { GraphEmpty } from '@console/internal/components/graphs/graph-empty';
import { DATA_CONSUMPTION_QUERIES, ObjectServiceDashboardQuery } from '../../constants/queries';
import {
  ACCOUNTS,
  BY_IOPS,
  BY_LOGICAL_USAGE,
  BY_PHYSICAL_VS_LOGICAL_USAGE,
  BY_EGRESS,
  PROVIDERS,
  CHART_LABELS,
} from '../../constants';
import { DataConsumptionDropdown } from './data-consumption-card-dropdown';
import {
  BarChartData,
  metricsChartDataMap,
  metricsChartLegendDataMap,
  numberInWords,
} from './data-consumption-card-utils';
import './data-consumption-card.scss';

const DataConsumersValue = {
  [PROVIDERS]: 'PROVIDERS_',
  [ACCOUNTS]: 'ACCOUNTS_',
};
const DataConsumersSortByValue = {
  [BY_IOPS]: 'BY_IOPS',
  [BY_LOGICAL_USAGE]: 'BY_LOGICAL_USAGE',
  [BY_PHYSICAL_VS_LOGICAL_USAGE]: 'BY_PHYSICAL_VS_LOGICAL_USAGE',
  [BY_EGRESS]: 'BY_EGRESS',
};

const DataConsumptionCard: React.FC<DashboardItemProps> = ({
  watchPrometheus,
  stopWatchPrometheusQuery,
  prometheusResults,
}) => {
  const [metricType, setMetricType] = React.useState(PROVIDERS);
  const [sortByKpi, setsortByKpi] = React.useState(BY_IOPS);

  React.useEffect(() => {
    const query =
      DATA_CONSUMPTION_QUERIES[
        ObjectServiceDashboardQuery[
          DataConsumersValue[metricType] + DataConsumersSortByValue[sortByKpi]
        ]
      ];
    watchPrometheus(query);
    return () => stopWatchPrometheusQuery(query);
  }, [watchPrometheus, stopWatchPrometheusQuery, metricType, sortByKpi]);

  const dataConsumptionQueryResult = prometheusResults.getIn([
    DATA_CONSUMPTION_QUERIES[
      ObjectServiceDashboardQuery[
        DataConsumersValue[metricType] + DataConsumersSortByValue[sortByKpi]
      ]
    ],
    'result',
  ]);

  let maxVal: number;
  let chartData = [];
  let legendData = [];
  let suffixLabel = '';
  const result = _.get(dataConsumptionQueryResult, 'data.result', []);
  if (result.length) {
    let maxData: BarChartData | any = {
      x: '',
      y: 0,
      name: '',
      yOriginal: 0,
      unit: '',
    };
    chartData = metricsChartDataMap[metricType][sortByKpi](result);
    legendData = metricsChartLegendDataMap[metricType][sortByKpi](chartData);
    maxData = _.maxBy(chartData.map((data) => _.maxBy(data, 'yOriginal')), 'yOriginal');
    const maxDataV = Number(maxData.yOriginal);
    const maxDataVStr = maxDataV.toFixed(1);
    let maxDataH = humanizeBinaryBytes(maxDataVStr);
    suffixLabel = maxDataH.unit;
    if (sortByKpi === BY_IOPS) {
      suffixLabel = numberInWords(maxDataV);
      maxDataH = humanizeNumber(maxDataVStr);
    }
    // if suffixLabel is a non-empty string, show it in expected form
    if (suffixLabel) suffixLabel = `(in ${suffixLabel})`;
    maxVal = Number(maxDataH.value);
  }

  const yTickValues = [
    Number((maxVal / 10).toFixed(1)),
    Number((maxVal / 5).toFixed(1)),
    Number(((3 * maxVal) / 10).toFixed(1)),
    maxVal,
    Number(((4 * maxVal) / 10).toFixed(1)),
    Number(((5 * maxVal) / 10).toFixed(1)),
    Number(((6 * maxVal) / 10).toFixed(1)),
    Number(((7 * maxVal) / 10).toFixed(1)),
    Number(((8 * maxVal) / 10).toFixed(1)),
    Number(((9 * maxVal) / 10).toFixed(1)),
    Number(Number(maxVal).toFixed(1)),
  ];

  return (
    <DashboardCard>
      <DashboardCardHeader>
        <DashboardCardTitle>Data Consumption</DashboardCardTitle>
        <DataConsumptionDropdown
          type={metricType}
          setType={setMetricType}
          kpi={sortByKpi}
          setKpi={setsortByKpi}
        />
      </DashboardCardHeader>
      <DashboardCardBody
        className="co-dashboard-card__body--top-margin"
        isLoading={!dataConsumptionQueryResult}
      >
        {chartData.length > 0 ? (
          <div>
            <span className="text-secondary">
              {CHART_LABELS[sortByKpi]} {suffixLabel}
            </span>
            <Chart
              themeColor={ChartThemeColor.purple}
              domain={{ y: [0, maxVal] }}
              domainPadding={{ x: [15, 20], y: [10, 10] }}
              padding={{ top: 20, bottom: 40, left: 50, right: 17 }}
              height={280}
            >
              <ChartAxis style={{ tickLabels: { padding: 5, fontSize: 10 } }} />
              <ChartAxis
                dependentAxis
                tickValues={yTickValues}
                style={{
                  tickLabels: { padding: 5, fontSize: 8, fontWeight: 500 },
                  grid: { stroke: '#4d525840' },
                }}
              />
              <ChartGroup offset={11}>
                {chartData.map((data) => (
                  <ChartBar key={data.name} data={data} />
                ))}
              </ChartGroup>
            </Chart>
            <ChartLegend
              themeColor={ChartThemeColor.purple}
              data={legendData}
              orientation="horizontal"
              height={40}
              width={500}
              style={{ labels: { fontSize: 10 } }}
            />
          </div>
        ) : (
          <GraphEmpty />
        )}
      </DashboardCardBody>
    </DashboardCard>
  );
};

export default withDashboardResources(DataConsumptionCard);
