## Expected file input format


```
{
  "file-uri": {
    "incidents": [
      {
        "uri": string,
        "message": string,
        "codeSnip": string
        "lineNumber": number,
      }
    ],
    "updatedContent": string,
    "originalContent": string
  }
}
```

Example:

```json
{
  "file:///home/abrugaro/WebstormProjects/kai-ci/coolstore/src/main/java/com/redhat/coolstore/model/OrderItem.java": {
    "incidents": [
      {
        "uri": "file:///home/abrugaro/WebstormProjects/kai-ci/coolstore/src/main/java/com/redhat/coolstore/model/OrderItem.java",
        "message": "The way in which Hibernate determines implicit names for sequences and tables associated with identifier generation has changed in 6.0 which may affect migrating applications. \n As of 6.0, Hibernate by default creates a sequence per entity hierarchy instead of a single sequence hibernate_sequence. \n Due to this change, users that previously used `@GeneratedValue(strategy = GenerationStrategy.AUTO)` or simply `@GeneratedValue` (since `AUTO` is the default), need to ensure that the database now contains sequences for every entity, named `<entity name>_seq`. For an entity Person, a sequence person_seq is expected to exist. \n It’s best to run hbm2ddl (e.g. by temporarily setting `hbm2ddl.auto=create`) to obtain a list of DDL statements for the sequences.",
        "codeSnip": "17  \n18      @Id\n19      @Column(name=\"ID\")\n20      @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = \"order_item_seq\")\n21      @SequenceGenerator(name = \"order_item_seq\", sequenceName = \"order_item_seq\")\n22      private long id;\n23  \n24      private int quantity;\n25  \n26      private String productId;\n27  \n28      public OrderItem() {}\n29  \n30      public String getProductId() {\n31          return productId;\n32      }\n33  \n34      public void setProductId(String productId) {\n35          this.productId = productId;\n36      }\n37  ",
        "lineNumber": 27
      }
    ],
    "updatedContent": "package com.redhat.coolstore.model;\n\nimport java.io.Serializable;\n\nimport jakarta.persistence.Column;\nimport jakarta.persistence.Entity;\nimport jakarta.persistence.GeneratedValue;\nimport jakarta.persistence.GenerationType;\nimport jakarta.persistence.Id;\nimport jakarta.persistence.SequenceGenerator;\nimport jakarta.persistence.Table;\n\n@Entity\n@Table(name = \"ORDER_ITEMS\")\npublic class OrderItem implements Serializable {\n    private static final long serialVersionUID = 64565445665456666L;\n\n    @Id\n    @Column(name=\"ID\")\n    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = \"order_item_seq\")\n    @SequenceGenerator(name = \"order_item_seq\", sequenceName = \"order_item_seq\")\n    private long id;\n\n    private int quantity;\n\n    private String productId;\n\n    public OrderItem() {}\n\n    public String getProductId() {\n        return productId;\n    }\n\n    public void setProductId(String productId) {\n        this.productId = productId;\n    }\n\n    public int getQuantity() {\n        return quantity;\n    }\n\n    public void setQuantity(int quantity) {\n        this.quantity = quantity;\n    }\n\n    @Override\n    public String toString() {\n        return \"OrderItem [productId=\" + productId + \", quantity=\" + quantity + \"]\";\n    }\n\n}",
    "originalContent": "package com.redhat.coolstore.model;\n\nimport java.io.Serializable;\n\nimport javax.persistence.Column;\nimport javax.persistence.Entity;\nimport javax.persistence.GeneratedValue;\nimport javax.persistence.Id;\nimport javax.persistence.Table;\n\n@Entity\n@Table(name = \"ORDER_ITEMS\")\npublic class OrderItem implements Serializable {\n\tprivate static final long serialVersionUID = 64565445665456666L;\n\n\t@Id\n\t@Column(name=\"ID\")\n\t@GeneratedValue\n\tprivate long id;\n\n\tprivate int quantity;\n\n\tprivate String productId;\n\n\tpublic OrderItem() {}\n\n\tpublic String getProductId() {\n\t\treturn productId;\n\t}\n\n\tpublic void setProductId(String productId) {\n\t\tthis.productId = productId;\n\t}\n\n\tpublic int getQuantity() {\n\t\treturn quantity;\n\t}\n\n\tpublic void setQuantity(int quantity) {\n\t\tthis.quantity = quantity;\n\t}\n\n\t@Override\n\tpublic String toString() {\n\t\treturn \"OrderItem [productId=\" + productId + \", quantity=\" + quantity + \"]\";\n\t}\n\n}"
  }
}
```