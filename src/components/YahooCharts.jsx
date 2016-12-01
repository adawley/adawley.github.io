var React = require('react');
var Recharts = require('recharts');


const {PropTypes} = React;

var TriangleBar = React.createClass({
    propTypes: {
        fill: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
    },

    getPath: function (x, y, width, height) {
        return `M${x},${y + height}
          C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3} ${x + width / 2}, ${y}
          C${x + width / 2},${y + height / 3} ${x + 2 * width / 3},${y + height} ${x + width}, ${y + height}
          Z`;
    },

    render: function () {
        const { fill, x, y, width, height } = this.props;
        return <path d={this.getPath(x, y, width, height)} stroke="none" fill={fill} />;
    }
});

var VerticalLine = React.createClass({
    propTypes: {
        fill: PropTypes.string,
        x: PropTypes.number,
        y: PropTypes.number,
        width: PropTypes.number,
        height: PropTypes.number,
    },

    render: function () {
        const { fill, x, y, width, height } = this.props;
        var realWidth = 3;
        var halfStart = x + ((width / 2) - (realWidth / 2));

        return <rect x={halfStart} y={y} width={realWidth} height={height} stroke="none" fill={fill} />;
    }
});

var YahooCharts = React.createClass({

    getInitialState: function () {
        return {
        };
    },

    render: function () {
        const {ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend} = Recharts;
        const data = [
            { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
            { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
            { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
            { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
            { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
            { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
            { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
        ];

        return (
            <div className='container'>
                <div className='form-inline'>
                    <div className='form-group'>
                        <label >Symbol</label>
                        <input className='form-control' value={this.state.symbolsInput} onChange={this.onChange} />
                    </div>
                    <button type="submit" className="btn btn-primary">Plot</button>
                </div>
                <ComposedChart width={600} height={300} data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="pv" stackId="a" fill="#8884d8" />
                    <Line type='monotone' dataKey='uv' stroke='#ff7300' />
                    <Bar dataKey="uv" stackId="a" fill="#73ff00" shape={<VerticalLine />} />
                    <Bar dataKey="amt" stackId="a" fill="#ff7300" shape={<VerticalLine />} />
                </ComposedChart>
            </div>
        );
    }

});

module.exports = YahooCharts;