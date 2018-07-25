require 'test_helper'

class MapControllerTest < ActionDispatch::IntegrationTest
  test "should get home" do
    get map_home_url
    assert_response :success
  end

end
