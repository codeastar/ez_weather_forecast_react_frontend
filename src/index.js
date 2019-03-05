import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import DatePicker from "react-datepicker"; 
import "react-datepicker/dist/react-datepicker.css";
import Geosuggest from 'react-geosuggest';
import axios from 'axios';
import moment from 'moment';
import WeatherIcon from 'react-icons-weather';

function cardLayout(props, i)
{
    let raining_chance = "--"; 
    if (props.raining_chance != null)
    {
        raining_chance = props.raining_chance;
    }  

    return (
        <div key={i}>
           <div className="weather_card"> 
              <div className="weather_info">
                <div><div className="report_item">Date:</div> {props.date}</div> 
                <div><div className="report_item">Max Temperature:</div> {props.max_temperature}</div> 
                <div><div className="report_item">Min Temperature:</div> {props.min_temperature}</div> 
                <div><div className="report_item">Summary:</div> {props.summary}</div>  
                <div><div className="report_item">Chance of rain:</div> {raining_chance}</div>  
              </div> 
              <div className="weather_icon">
                <WeatherIcon name="darksky" iconId={props.icon} />  
              </div>
           </div>          
        </div>
      );
}//cardLayout

function Weathercard(props, location) 
{
    let weather_reports = props.reports;

    let reports_length = 0;
    let json_reports = [];

    if (typeof weather_reports !== 'undefined')
    {
        json_reports=JSON.parse(weather_reports);
        reports_length = json_reports.length;
    }//if not undefined

    var rows = [];
    for (var i = 0; i < reports_length; i++) {
        rows.push( cardLayout(json_reports[i], i));
    }

    return (
      <div>
          <div className="location">{location}</div>
          <div>
            {rows}
          </div>
      </div>
    );
}//function Weathercard

class Ezw extends React.Component {

    constructor(props) {
        super(props);
              this.state = 
        {
          startDate: new Date(),
          endDate: new Date(), 
          latitude: null,
          longitude: null,
          readyToSubmit: false, 
          location: null,
          status: "Enter date and location..."
        };
        //bind to make `this` work in the callback
        this.handleChangeStart = this.handleChangeStart.bind(this);
        this.handleChangeEnd = this.handleChangeEnd.bind(this);
        this.handleLocation = this.handleLocation.bind(this);
        this.resetLocation = this.resetLocation.bind(this);
        this.getDateResult = this.getDateResult.bind(this);
    }

    getDateResult()
    {
        this.setState({
            status: "Processing...",
           });
        
        //send to server         
        let json_req = {"latitude": this.state.latitude, "longitude": this.state.longitude, 
        "start_date": moment(this.state.startDate).format('YYYY-MM-DD'), "end_date":moment(this.state.endDate).format('YYYY-MM-DD')};
           
        axios.post(process.env.REACT_APP_EZW_API,json_req)      
            .then(res => {
               this.setState({
                   status: Weathercard(res.data, this.state.location)
                });
            })   //axios   
       
    }//getDateResult
        
    handleChangeStart(date) 
    {
        if (date > this.state.endDate)
        {
            this.setState({
                endDate: date
              });
        }

        this.setState({
          startDate: date
        });
    }//handleChangeStart

    handleChangeEnd(date) 
    {
        if (date < this.state.startDate)
        {
            this.setState({
                startDate: date
              });
        }

        this.setState({
            endDate: date
        });
    }//handleChangeEnd

    handleLocation(loc)
    {
        if (typeof loc !== 'undefined')
        { 
            this.setState({
                latitude: loc.location.lat,
                longitude: loc.location.lng,
                location: loc.label,
                readyToSubmit: true,
                status: "Ready to Send"
              });
        }
    }

    resetLocation() 
    {
        this.setState({
            latitude: null,
            longitude: null,
            readyToSubmit: false,
            status: "Enter date and location..."
        });
    }//handleChangeEnd

    render() 
    {
      let weather_report;
      weather_report = this.state.status;

      var fixtures = [
        {label: 'Mountain View Station, Mountain View, CA, USA', location: {lat: 37.3945565, lng: -122.0782263}},  
        {label: 'Mountain View Public Library, Franklin St, Mountain View, CA, USA', location: {lat: 37.3968885, lng: -122.0929291}},         
      ];

      return (      
        <div>
        <h1>EZ Weather Forecast React Frontend</h1>
            <div className="comp_ezw">
                <div>Date range:</div>
                <DatePicker
                selected={this.state.startDate}
                selectsStart
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                onChange={this.handleChangeStart}
                dateFormat="dd-MM-YYYY"
                className="ezw_datepicker"
                />
                <div className="ezw_to">TO</div>
                <DatePicker
                selected={this.state.endDate}
                selectsEnd
                startDate={this.state.startDate}
                endDate={this.state.endDate}
                onChange={this.handleChangeEnd}
                dateFormat="dd-MM-YYYY"
                className="ezw_datepicker"
                />
            </div>
            <div className="comp_ezw">
                <div>Location:</div>
                <Geosuggest
                ref={el=>this._geoSuggest=el}
                placeholder="Start typing!"
                initialValue="Mountain View"
                fixtures={fixtures}
                onSuggestSelect={this.handleLocation}
                onChange={this.resetLocation}
                location={new window.google.maps.LatLng(37.38605, -122.08385)}
                radius="20" />      
            </div>
            <div className="comp_ezw">
                <button 
                    onClick={this.getDateResult }
                    disabled={!this.state.readyToSubmit} 
                    className="button_ezw"                               
                    >
                    SUBMIT
                </button>  
			</div>
            <div className="report_ezw">
                {weather_report}                
            </div>
        </div>
      );
    }//render
}//ezw

ReactDOM.render(
    <Ezw />,
    document.getElementById('root')
  );