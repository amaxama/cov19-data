import React, { PureComponent } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import _ from 'lodash';
// import BackgroundSlider from 'react-background-slider';
// import image1 from './assets/Attach167853_20200412_135908.jpg'


class CustomizedAxisTick extends PureComponent {
    render() {
        const {
            x, y, stroke, payload,
        } = this.props;

        return (
            <g transform={`translate(${x},${y})`}>
                <text x={0} y={0} dy={16} textAnchor="end" fill="#666" transform="rotate(-90)">{payload.value}</text>
            </g>
        );
    }
}


class Example extends PureComponent {

    state = {
        mnData: null,
        ilData: null,
        mergedData: null
    };

    componentDidMount() {
        // Call our fetch functions below once the component mounts
        this.fetchMnData()
            .then(res => this.setState({ mnData: res.data }))
            .then(res => console.log("response: " + res))
            .catch(err => console.log(err));
        this.fetchIlData()
            .then(res => this.setState({ ilData: res.data }))
            .then(res => console.log("response: " + res))
            .catch(err => console.log(err));
        this.fetchMergedData()
            .then(res => this.setState({ mergedData: res }))
            .then(res => console.log("response: " + res))
            .catch(err => console.log(err));



    }

    fetchMnData = async () => {
        const response = await fetch('/api/data?url=https://www.health.state.mn.us/diseases/coronavirus/situation.html');
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message)
        }
        return body;
    };

    fetchIlData = async () => {
        const response = await fetch('/api/ilData?url=https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Illinois');
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message)
        }
        return body;
    };

    fetchMergedData = async () => {
        const ilResponse = await fetch('/api/data?url=https://www.health.state.mn.us/diseases/coronavirus/situation.html');
        const ilBody = await ilResponse.json();

        if (ilResponse.status !== 200) {
            throw Error(ilBody.message)
        }
        const ilData = ilBody.data;

        const mnResponse = await fetch('/api/ilData?url=https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Illinois');
        const mnBody = await mnResponse.json();

        if (mnResponse.status !== 200) {
            throw Error(mnBody.message)
        }
        const mnData = mnBody.data;

        const merged = _.mergeWith(mnData, ilData);
        const mData = mnData.concat(ilData);
        mData.filter(function (v) {
            return this[v.name] ?
                Object.assign(this[v.name], v) :
                (this[v.name] = v);
        }, {});
        // console.log(mnData);
        return mnData;
    };


    render() {
        return (
            <div>
                <div>
                    <h1>Covid19 Cases</h1>
                    <hr />
                    <div className="container">
                        <h3>MN Data</h3>
                        <ResponsiveContainer width="95%" height={300}>
                            <BarChart
                                data={this.state.mnData}
                                margin={{
                                    top: 5, right: 30, left: 20, bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: 'Cases', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="MN_new" fill="#900c3f" name="New" />
                                <Bar dataKey="MN_total" fill="#511845" name="Total" />
                            </BarChart>
                        </ResponsiveContainer>
                        <br />
                        <h3>IL Data</h3>
                        <ResponsiveContainer width="95%" height={300}>
                            <BarChart
                                data={this.state.ilData}
                                margin={{
                                    top: 5, right: 30, left: 20, bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis label={{ value: 'Cases', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="IL_new" fill="#82ca9d" name="New" />
                                <Bar dataKey="IL_total" fill="#008080" name="Total" />
                            </BarChart>
                        </ResponsiveContainer>
                        <br />
                        <h3>IL & MN Data</h3>
                        <ResponsiveContainer width="95%" height={500}>
                            <BarChart
                                data={this.state.mergedData}
                                margin={{
                                    top: 5, right: 30, left: 20, bottom: 5,
                                }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" height={60} tick={<CustomizedAxisTick />} />
                                <YAxis label={{ value: 'Cases', angle: -90, position: 'insideLeft' }} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="MN_new" fill="#900c3f" name="MN New" />
                                <Bar dataKey="IL_new" fill="#82ca9d" name="IL New" />
                                <Bar dataKey="MN_total" fill="#511845" name="MN Total" />
                                <Bar dataKey="IL_total" fill="#008080" name="IL Total" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {/* <BackgroundSlider
                    images={[image1, image2, image3]}
                    duration={3}
                    transition={1}
                /> */}
            </div>
        );
    }
}

export default Example;