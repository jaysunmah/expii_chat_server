var Profile = Backbone.Model.extend({
        defaults : {
          name    : null,
          gender  : null,
          picture : null
        }
      });
  
      var profile = new Profile({
        name    : "Christopher Pitt",
        gender  : "male",
        picture : "http://placekitten.com/200/200"
      });
  
      console.log(
        "name    : " + profile.get("name") + "\n" +
        "gender  : " + profile.get("gender") + "\n" +
        "picture : " + profile.get("picture")
      );

var CardComponent = React.createClass({
        render : function() {
          return (
            <div className="card">
              <div className="picture">
                <img src={this.props.profile.get("picture")} />
              </div>
              <div className="name">
                {this.props.profile.get("name")}
                <small>
                  ({this.props.profile.get("gender")})
                </small>
              </div>
              <div>
                <form className="commentForm">
                  <input type="text" placeholder="Say something..." />
                  <input type="submit" value="Post" />
                </form>
              </div>
            </div>
          );
        }
      });
ReactDOM.render(
        <CardComponent profile={profile} />,
        document.body
      ); 
