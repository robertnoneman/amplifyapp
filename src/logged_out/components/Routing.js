import React, { memo } from "react";
import PropTypes from "prop-types";
import { Switch } from "react-router-dom";
import PropsRoute from "../../shared/components/PropsRoute";
import Home from "./home/Home";
import Blog from "./blog/Blog";
import BlogPost from "./blog/BlogPost";
import SandboxPage from "./sandboxpage/SandboxPage"
import WeatherMap from "./weather_maps/WeatherMap"

function Routing(props) {
  const { blogPosts, selectBlog, selectHome, selectSandbox, selectWeather } = props;
  return (
    <Switch>
      {blogPosts.map((post) => (
        <PropsRoute
          path={post.url}
          component={BlogPost}
          title={post.title}
          key={post.title}
          src={post.src}
          date={post.date}
          content={post.content}
          otherArticles={blogPosts.filter(
            (blogPost) => blogPost.id !== post.id
          )}
        />
      ))}
      <PropsRoute
        exact
        path="/blog"
        component={Blog}
        selectBlog={selectBlog}
        blogPosts={blogPosts}
      />
      
      
      <PropsRoute path="/SandboxPage" component={SandboxPage} selectSandbox={selectSandbox} />
      <PropsRoute path="/weather_maps" component={WeatherMap} selectWeather={selectWeather} />
      <PropsRoute path="/" component={Home} selectHome={selectHome} />
      
      
    </Switch>
  );
}

Routing.propTypes = {
  blogposts: PropTypes.arrayOf(PropTypes.object),
  selectHome: PropTypes.func.isRequired,
  selectBlog: PropTypes.func.isRequired,
  selectSandbox: PropTypes.func.isRequired,
  selectWeather: PropTypes.func.isRequired
};

export default memo(Routing);
