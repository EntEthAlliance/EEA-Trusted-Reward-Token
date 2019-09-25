pragma solidity ^0.5.0;

library Set
{
	struct set
	{
		bytes32[] members;
		mapping(bytes32 => uint256) indexes;
	}

	function length(set storage _list)
	internal view returns (uint256)
	{
		return _list.members.length;
	}

	function at(set storage _list, uint256 _index)
	internal view returns (bytes32)
	{
		return _list.members[_index - 1];
	}

	function indexOf(set storage _list, bytes32 _value)
	internal view returns (uint256)
	{
		return _list.indexes[_value];
	}

	function contains(set storage _list, bytes32 _value)
	internal view returns (bool)
	{
		return indexOf(_list, _value) != 0;
	}

	function content(set storage _list)
	internal view returns (bytes32[] memory)
	{
		return _list.members;
	}

	function add(set storage _list, bytes32 _value)
	internal returns (bool)
	{
		if (contains(_list, _value))
		{
			return false;
		}
		_list.indexes[_value] = _list.members.push(_value);
		return true;
	}

	function remove(set storage _list, bytes32 _value)
	internal returns (bool)
	{
		if (!contains(_list, _value))
		{
			return false;
		}

		uint256 i    = indexOf(_list, _value);
		uint256 last = length(_list);

		if (i != last)
		{
			bytes32 swapValue = _list.members[last - 1];
			_list.members[i - 1] = swapValue;
			_list.indexes[swapValue] = i;
		}

		delete _list.indexes[_value];
		--_list.members.length;

		return true;
	}

}
