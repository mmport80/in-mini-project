//import "machine_learning";
import "d3";
import "babel-polyfill";
import moment from 'moment';
import * as ml from 'machine_learning';
import * as fp from 'lodash/fp';


const postBox = function*(){
  const data = yield;
  //map to array for ml lib input
  //nick, gender, date of birth, country
  const d =
    fp.reduce(
      (a,u) =>
          ({  data: a.data.concat( [ [ u.nickname.length, u.gender, +moment(u.dob), u.country ] ] )
            , result: a.result.concat(u.seeking)
            })
        , {data: [], result: []}
      )
      (data);

  const dt = new ml.DecisionTree( d );
  dt.build();
  //avoid overfitting, by trading correctness in this case for robustness and simplicity
  dt.prune(0.1);

  console.log(d);

  document.querySelector('#nick');
  document.querySelector('#gender');
  document.querySelector('#dob');
  document.querySelector('#country');

  //send to new postBox
  //set up listeners
  //send updates
  //classify

  console.log("Classify : ", dt.classify( ["xoxo","Female",97542000000,1] ) );
  }

const send2 = postBox();
send2.next();

d3.csv( "data.csv", data => send2.next(data) );
