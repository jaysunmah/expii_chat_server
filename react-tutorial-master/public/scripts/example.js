/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only. Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 * WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

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
for (var i = 0; i < 10; i++) {
 ReactDOM.render(
        <CardComponent profile={profile} />,
        document.body
      ); 
}




