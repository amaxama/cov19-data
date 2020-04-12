import React, { PureComponent } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label
} from 'recharts';
import _ from 'lodash';


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
    // static jsfiddleUrl = 'https://jsfiddle.net/alidingling/30763kr7/';
    state = {
        mnData: null,
        ilData: null,
        mergedData: null
    };

    componentDidMount() {
        // Call our fetch function below once the component mounts
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
        console.log("got response");
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message)
        }
        return body;
    };

    fetchIlData = async () => {
        const response = await fetch('/api/ilData?url=https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Illinois');
        console.log("got response");
        const body = await response.json();

        if (response.status !== 200) {
            throw Error(body.message)
        }
        return body;
    };

    fetchMergedData = async () => {
        const ilResponse = await fetch('/api/data?url=https://www.health.state.mn.us/diseases/coronavirus/situation.html');
        console.log("got response");
        const ilBody = await ilResponse.json();

        if (ilResponse.status !== 200) {
            throw Error(ilBody.message)
        }
        const ilData = ilBody.data;

        const mnResponse = await fetch('/api/ilData?url=https://en.wikipedia.org/wiki/2020_coronavirus_pandemic_in_Illinois');
        console.log("got response");
        const mnBody = await mnResponse.json();

        if (mnResponse.status !== 200) {
            throw Error(mnBody.message)
        }
        const mnData = mnBody.data;

        console.log(mnData.slice(0, mnData.length));
        console.log(ilData.slice(0, ilData.length));
        const merged = _.mergeWith(mnData, ilData);
        console.log(merged.slice(0, merged.length));
        const mData = mnData.concat(ilData);
        console.log("mdata: " + mData);
        mData.filter(function (v) {
            return this[v.name] ?
                Object.assign(this[v.name], v) :
                (this[v.name] = v);
        }, {});
        console.log(mnData);
        return mnData;
    };




    // fetchMergedData = () => {
    //     var mData = this.state.mnData.concat(this.state.ilData);
    //     const newData = mData.filter(function(v) {
    //         return this[v.name]?
    //           !Object.assign(this[v.name], v):
    //           (this[v.name] = v);
    //       }, {});
    //     console.log(newData);
    //     return newData;
    // }

    render() {
        return (
            <div>
                <h1>Covid19 Cases</h1>
                <hr/>
                <div className="container">
                    <h3>MN Data</h3>
                    <BarChart
                        width={750}
                        height={300}
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
                    <br />
                    <h3>IL Data</h3>
                    <BarChart
                        width={750}
                        height={300}
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
                    <br />
                    <h3>IL & MN Data</h3>
                    <BarChart
                        width={7500}
                        height={300}
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
                </div>
            </div>
        );
    }
}

export default Example;