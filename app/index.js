//csv parsing
import "d3";
//generator functions
import "babel-polyfill";
//dates
import moment from 'moment';
//decision tree ml, in order to predict group a user will belong to
import * as ml from 'machine_learning';
//fp flavour of lodash
import * as fp from 'lodash/fp';

//$ in es6
const qs = s => document.querySelector( s );

//update listeners
const update = ( m, d, i, tree ) => {
  //update 'model'
  m[i] = d.value;
  //update listeners
  fp.each
    ( (id, ix) =>
      qs(id).onchange = _ =>
        update( m, qs(id), ix, tree )
      )
    //IDs of form elements
    (['#nick','#gender','#dob','#country'])
  //make prediction
  result = tree.classify( m );
  //update result on screen
  qs('#result').innerHTML = Object.keys(result)[0];
  }

//prefer this over async await, until it becomes standard
const postBox = function*(){
  const data = yield;
  //map to data and result arrays for ml lib input
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

  //build
  const tree = new ml.DecisionTree( d );
  tree.build();
  //avoid overfitting, by trading correctness in this case for robustness and simplicity
  tree.prune(0.1);

  //init values to classify
  const newUser = [qs("#nick").value.length, qs("#gender").value, +moment(qs("#dob").value), qs("#country").value];
  //update listeners
  update(newUser, qs('#nick'), 0, tree);
  }

//set up postbox
const send2 = postBox();
send2.next();

//parse
d3.csv( "data.csv", data => send2.next(data) );
