import React, { Component } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  FlatList,
  Button,
} from "react-native";
import { Header, Icon } from "react-native-elements";
import RBSheet from "react-native-raw-bottom-sheet";
import AsyncStorage from "@react-native-community/async-storage";

const STORAGE_KEY = "@save_contacts";

const HiddenView = (props) => {
  const { hide, onPress } = props;
  if (!hide) {
    return null;
  } else {
    return <Icon name="delete" color="red" onPress={onPress} />;
  }
};

class App extends Component {
  constructor() {
    super();
    this.state = {
      deleteMode: false,
      newContactName: "",
      newContactPhoneNumber: "",
      contactList: [],
    };
    this.renderItem = this.renderItem.bind(this);
    this.addContact = this.addContact.bind(this);
    this.handleDeleteMode = this.handleDeleteMode.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.saveData = this.saveData.bind(this);
    this.clearStorage = this.clearStorage.bind(this);
  }

  renderItem({ item }) {
    const numArr = item.phoneNumber.split("");
    numArr.unshift("(");
    numArr.splice(4, 0, ")");
    numArr.splice(5, 0, " ");
    numArr.splice(9, 0, "-");
    const formattedNumber = numArr.join("");
    return (
      <View style={styles.contactContainer}>
        <HiddenView
          onPress={() => {
            this.handleDelete(item.id);
          }}
          hide={this.state.deleteMode}
        />
        <Text style={styles.nameText}>{item.name}</Text>
        <Text style={styles.phoneText}>+1 {formattedNumber}</Text>
      </View>
    );
  }

  async componentDidMount() {
    try {
      const myContacts = await AsyncStorage.getItem(STORAGE_KEY);
      if (myContacts !== null) {
        const contacts = JSON.parse(myContacts);
        this.setState({
          contactList: contacts,
        });
      }
    } catch (e) {
      console.log("Error receiving data", e);
    }
  }

  addContact() {
    const list = this.state.contactList;
    var min = new Date().getMinutes();
    var sec = new Date().getSeconds();
    const randomID = min + sec;
    const contact = {
      id: randomID,
      name: this.state.newContactName,
      phoneNumber: this.state.newContactPhoneNumber,
    };
    list.push(contact);
    this.setState({
      contactList: list,
      newContactName: "",
      newContactPhoneNumber: "",
    });
    this.saveData(list);
    console.log(list);
  }

  async saveData(list) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch (e) {
      console.log("Error saving data", e);
    }
  }

  handleDeleteMode() {
    this.setState({
      deleteMode: !this.state.deleteMode,
    });
  }

  async clearStorage() {
    try {
      await AsyncStorage.clear();
      alert("Item deleted");
    } catch (e) {
      alert("Error deleting item");
    }
  }

  handleDelete(id) {
    const filteredList = this.state.contactList.filter(
      (item) => item.id !== id
    );
    this.clearStorage();
    this.saveData(filteredList);
    this.setState({
      contactList: filteredList,
      deleteMode: false,
    });
  }

  render() {
    return (
      <View style={styles.container}>
        <Header
          containerStyle={styles.header}
          leftComponent={{
            text: "Edit",
            style: { color: "#fff", fontWeight: "600", paddingLeft: 5 },
            onPress: this.handleDeleteMode,
          }}
          centerComponent={{
            text: "Contact List",
            style: { color: "#fff", fontSize: 20, fontWeight: "800" },
          }}
          rightComponent={{
            icon: "add",
            color: "#fff",
            onPress: () => {
              this.RBSheet.open();
            },
          }}
        />
        <View style={styles.listContainer}>
          <FlatList
            data={this.state.contactList}
            renderItem={this.renderItem}
            keyExtractor={(item, index) => {
              item.phoneNumber + index;
            }}
          />
        </View>
        <RBSheet
          ref={(ref) => {
            this.RBSheet = ref;
          }}
          height={300}
          customStyles={{
            container: {
              backgroundColor: "cornflowerblue",
            },
          }}
        >
          <Text style={styles.modalTitle}>Add New Contact</Text>
          <TextInput
            value={this.state.newContactName}
            onChangeText={(text) => {
              this.setState({
                newContactName: text,
              });
              console.log(this.state.newContactName);
            }}
            style={styles.nameInput}
            placeholder="Enter contact name"
          />
          <TextInput
            value={this.state.newContactPhoneNumber}
            onChangeText={(text) => {
              this.setState({
                newContactPhoneNumber: text,
              });
            }}
            style={styles.nameInput}
            placeholder="Enter contact phone number"
          />
          <Button
            title="Add Contact"
            style={styles.button}
            color="white"
            onPress={() => {
              this.addContact();
              this.RBSheet.close();
            }}
          />
        </RBSheet>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    height: 60,
  },
  container: {
    flex: 1,
    backgroundColor: "lightsteelblue",
  },
  contactContainer: {
    backgroundColor: "cornflowerblue",
    paddingHorizontal: 15,
    paddingVertical: 5,
    flexDirection: "row",
    justifyContent: "space-between",
    borderWidth: 2,
    borderRadius: 30,
    borderColor: "cornflowerblue",
    margin: 5,
  },
  nameInput: {
    paddingLeft: 20,
    marginVertical: 10,
    marginHorizontal: 25,
    height: 40,
    borderRadius: 25,
    borderColor: "lightsteelblue",
    borderWidth: 1,
    backgroundColor: "lightsteelblue",
  },
  listContainer: {
    marginHorizontal: 10,
    marginVertical: 20,
  },
  nameText: {
    fontSize: 18,
    color: "white",
    letterSpacing: 1,
    fontWeight: "500",
    flex: 1,
  },
  phoneText: {
    fontSize: 18,
    color: "white",
    letterSpacing: 1,
    fontWeight: "500",
  },
  header: {
    backgroundColor: "cornflowerblue",
    paddingTop: 25,
    height: 80,
  },
  modalTitle: {
    textAlign: "center",
    margin: 25,
    fontSize: 22,
    fontWeight: "800",
    color: "white",
  },
});

export default App;
